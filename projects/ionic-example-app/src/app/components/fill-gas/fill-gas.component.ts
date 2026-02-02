import { CommonModule } from '@angular/common';
import { AfterViewInit, Component, CUSTOM_ELEMENTS_SCHEMA, ElementRef, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { FormGroup, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import {
  IonButton,
  IonContent,
  IonIcon,
  IonItem,
  IonLabel,
  IonList,
  IonSearchbar,
  IonSegment,
  IonSegmentButton,
  IonSpinner
} from '@ionic/angular/standalone';
import { FormlyFieldConfig, FormlyModule } from '@ngx-formly/core';
import { AuthService } from '@rosoftlab/core';
import { BrowserMultiFormatReader, IScannerControls } from '@zxing/browser';
import { addIcons } from 'ionicons';
import {
  arrowForwardOutline,
  cameraOutline,
  carOutline,
  checkmarkCircle,
  qrCodeOutline,
  sendOutline
} from 'ionicons/icons';
import { Car } from '../../services/car/car';
import { CarService } from '../../services/car/car.service';
import { FuelTransaction } from '../../services/fuel-transaction/fuel-transaction';
import { FuelTransactionService } from '../../services/fuel-transaction/fuel-transaction.service';
import { Warehouse } from '../../services/warehouse/warehouse';
import { WarehouseService } from '../../services/warehouse/warehouse.service';

@Component({
  selector: 'app-fill-gas',
  templateUrl: './fill-gas.component.html',
  styleUrls: ['./fill-gas.component.scss'],
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FormlyModule,
    IonContent,
    IonButton,
    IonIcon,
    IonList,
    IonItem,
    IonLabel,
    IonSearchbar,
    IonSpinner,
    IonSegment,
    IonSegmentButton
  ],
  schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class FillGasComponent implements OnInit, AfterViewInit, OnDestroy {
  @ViewChild('fillSwiper', { static: false }) fillSwiper?: ElementRef<HTMLElement>;
  @ViewChild('qrVideo', { static: false }) qrVideo?: ElementRef<HTMLVideoElement>;
  @ViewChild('odometerVideo', { static: false }) odometerVideo?: ElementRef<HTMLVideoElement>;
  @ViewChild('pumpVideo', { static: false }) pumpVideo?: ElementRef<HTMLVideoElement>;

  form = new FormGroup({});
  car?: Car;
  destinationWarehouse?: Warehouse;
  originWarehouse?: Warehouse;
  warehouses: Warehouse[] = [];
  filteredWarehouses: Warehouse[] = [];
  isLoadingWarehouses = false;
  warehouseSearch = '';
  vehicleId?: string;
  qrPayload?: {
    id: string;
    type?: string;
    hasOdometer?: boolean;
    requireDescription?: boolean;
  };
  hasOdometer = true;
  requireDescription = false;
  showOdometerPhotoSlide = false;
  showPumpPhotoSlide = false;
  qrError?: string;
  activeTab: 'scan' | 'list' = 'scan';
  isLoadingCars = false;
  cars: Car[] = [];
  filteredCars: Car[] = [];
  combinedList: Array<{
    type: 'car' | 'warehouse';
    title: string;
    subtitle?: string;
    sortKey: string;
    car?: Car;
    warehouse?: Warehouse;
  }> = [];
  selectedListItem?: { type: 'car' | 'warehouse'; id: string };
  carSearch = '';
  private qrReader?: BrowserMultiFormatReader;
  private qrControls?: IScannerControls;
  private isResolvingPump = false;
  private lastScanAt = 0;
  private readonly scanCooldownMs = 1500;
  userName = '';
  odometerPhotoData?: string;
  pumpPhotoData?: string;
  private odometerStream?: MediaStream;
  private pumpStream?: MediaStream;
  private initialWarehouseId?: string;

  fuelModel: FuelTransaction = new FuelTransaction();

  kmFields: FormlyFieldConfig[] = [];
  litersFields: FormlyFieldConfig[] = [];

  isProcessing = false;

  constructor(
    private carService: CarService,
    private warehouseService: WarehouseService,
    private authService: AuthService,
    private fuelTransactionService: FuelTransactionService,
    private route: ActivatedRoute
  ) {
    addIcons({ cameraOutline, sendOutline, checkmarkCircle, qrCodeOutline, arrowForwardOutline, carOutline });
  }

  ngOnInit() {
    this.fuelModel.employeeId = this.authService.getId ?? undefined;
    this.userName = this.authService.name;
    const routeId = this.route.snapshot.paramMap.get('id');
    if (routeId) {
      this.initialWarehouseId = routeId;
      this.fuelModel.warehouseId = routeId;
    } else {
      this.loadWarehouses();
    }
    this.buildFormFields();
  }

  ngAfterViewInit() {
    if (this.fuelModel.warehouseId) {
      this.startQrScanner();
    }
    setTimeout(() => this.handlePhotoPreview(), 0);
  }

  applyQrPayload(payload: { id: string; type?: string; hasOdometer?: boolean; requireDescription?: boolean }) {
    this.qrPayload = payload;
    this.vehicleId = payload.id;
    this.fuelModel.carId = payload.id;
    if (typeof payload.hasOdometer === 'boolean') {
      this.hasOdometer = payload.hasOdometer;
    }
    if (typeof payload.requireDescription === 'boolean') {
      this.requireDescription = payload.requireDescription;
    }
    this.loadVehicle(payload.id);
    this.tryAdvanceFromStep1();
  }

  onTabChanged(value: 'scan' | 'list') {
    const tab = value;
    if (!tab || tab === this.activeTab) {
      return;
    }
    this.activeTab = tab;
    if (tab === 'scan') {
      if (!this.vehicleId) {
        this.startQrScanner();
      }
      return;
    }
    this.stopQrScanner();
    if (this.cars.length === 0) {
      this.loadCars();
    }
    if (this.warehouses.length === 0) {
      this.loadWarehouses();
    }
  }

  onCarSearch(event: CustomEvent) {
    const value = (event.detail?.value ?? '').toString();
    this.carSearch = value;
    this.filterCars();
  }

  onListSearch(event: CustomEvent) {
    const value = (event.detail?.value ?? '').toString();
    this.carSearch = value;
    this.warehouseSearch = value;
    this.filterCars();
    this.filterWarehouses();
  }

  selectCar(car: Car) {
    if (!car?.id) {
      return;
    }
    this.selectedListItem = { type: 'car', id: car.id };
    this.fuelModel.destinationWarehouseId = undefined;
    this.destinationWarehouse = undefined;
    this.requireDescription = false;
    this.applyQrPayload({ id: car.id, type: 'car' });
    this.stopQrScanner();
    this.tryAdvanceFromStep1();
  }

  selectWarehouseForOrigin(warehouse: Warehouse) {
    if (!warehouse?.id) {
      return;
    }
    this.fuelModel.warehouseId = warehouse.id;
    this.originWarehouse = warehouse;
    if (this.fuelModel.destinationWarehouseId === warehouse.id) {
      this.fuelModel.destinationWarehouseId = undefined;
    }
    this.filterWarehouses();
    this.startQrScanner();
  }

  selectWarehouseForDestination(warehouse: Warehouse) {
    if (!warehouse?.id) {
      return;
    }
    this.selectedListItem = { type: 'warehouse', id: warehouse.id };
    this.fuelModel.carId = undefined;
    this.vehicleId = undefined;
    this.car = undefined;
    this.destinationWarehouse = warehouse;
    this.fuelModel.destinationWarehouseId = warehouse.id;
    this.requireDescription = true;
    this.buildFormFields();
    this.tryAdvanceFromStep1();
  }

  loadVehicle(vehicleId: string) {
    this.vehicleId = vehicleId;
    this.carService.get(vehicleId).subscribe((data) => {
      this.car = data;
      this.applyVehicleInfo(data);
    });
  }

  applyVehicleInfo(car: Car) {
    const fields = car?.fields ?? {};
    if (!this.qrPayload || typeof this.qrPayload.hasOdometer !== 'boolean') {
      this.hasOdometer = Boolean(fields.hasOdometer ?? fields.odometer ?? true);
    }
    if (!this.qrPayload || typeof this.qrPayload.requireDescription !== 'boolean') {
      this.requireDescription = Boolean(fields.requireFuelDescription ?? fields.requireDescription ?? false);
    }
    this.showOdometerPhotoSlide = this.hasOdometer && Math.random() < 0.5;
    this.showPumpPhotoSlide = Math.random() < 0.5;
    this.buildFormFields();
  }

  buildFormFields() {
    this.kmFields = [
      {
        key: 'kilometersOrHours',
        type: 'input',
        templateOptions: {
          label: 'Nr. Kilometri / Nr. Ore',
          placeholder: '0.00',
          type: 'number',
          required: this.hasOdometer
        }
      }
    ];

    this.litersFields = [
      {
        key: 'liters',
        type: 'input',
        templateOptions: {
          label: 'Litri',
          placeholder: '0.00',
          type: 'number',
          required: true
        }
      },
      ...(this.requireDescription
        ? [
            {
              key: 'description',
              type: 'textarea',
              templateOptions: {
                label: 'Descriere Alimentare',
                required: true
              }
            }
          ]
        : [])
    ];
  }

  nextSlide() {
    const swiperEl = this.fillSwiper?.nativeElement as any;
    swiperEl?.swiper?.slideNext();
    setTimeout(() => this.handlePhotoPreview(), 0);
  }

  prevSlide() {
    const swiperEl = this.fillSwiper?.nativeElement as any;
    swiperEl?.swiper?.slidePrev();
    setTimeout(() => this.handlePhotoPreview(), 0);
  }

  onSlideChanged() {
    setTimeout(() => {
      this.handlePhotoPreview();
      this.handleQrPreview();
    }, 0);
  }

  submit() {
    if (!this.form.valid || this.isProcessing) {
      this.form.markAllAsTouched();
      return;
    }
    this.isProcessing = true;
    this.fuelModel.carId = this.vehicleId ?? this.fuelModel.carId;
    this.fuelModel.transactionDate = this.fuelModel.transactionDate ?? new Date();
    this.fuelTransactionService.save(this.fuelModel).subscribe({
      next: (saved) => {
        if (saved?.id) {
          this.fuelModel.id = saved.id;
        }
        this.resetAfterSave();
        alert('Alimentare Înregistrată cu Succes!');
      },
      error: (error) => {
        console.error('Fuel save error', error);
        this.isProcessing = false;
        alert('Nu am putut salva alimentarea. Încearcă din nou.');
      }
    });
  }

  private resetAfterSave() {
    const employeeId = this.authService.getId ?? undefined;
    const warehouseId = this.initialWarehouseId;

    this.fuelModel = new FuelTransaction();
    this.fuelModel.employeeId = employeeId;
    if (warehouseId) {
      this.fuelModel.warehouseId = warehouseId;
    }

    this.vehicleId = undefined;
    this.car = undefined;
    this.destinationWarehouse = undefined;
    this.originWarehouse = undefined;
    this.qrPayload = undefined;
    this.hasOdometer = true;
    this.requireDescription = false;
    this.showOdometerPhotoSlide = false;
    this.showPumpPhotoSlide = false;
    this.qrError = undefined;
    this.activeTab = 'scan';
    this.selectedListItem = undefined;
    this.carSearch = '';
    this.warehouseSearch = '';
    this.odometerPhotoData = undefined;
    this.pumpPhotoData = undefined;

    this.stopStream(this.odometerStream);
    this.stopStream(this.pumpStream);
    this.odometerStream = undefined;
    this.pumpStream = undefined;

    this.form.reset();
    this.form.markAsPristine();
    this.form.markAsUntouched();

    this.buildFormFields();
    this.filterCars();
    this.filterWarehouses();

    if (warehouseId) {
      this.setOriginWarehouseById(warehouseId);
    }

    const swiperEl = this.fillSwiper?.nativeElement as any;
    swiperEl?.swiper?.slideTo(0, 0);
    this.isProcessing = false;
    setTimeout(() => {
      this.handlePhotoPreview();
      this.handleQrPreview();
    }, 0);
  }

  ngOnDestroy() {
    this.stopQrScanner();
    this.stopStream(this.odometerStream);
    this.stopStream(this.pumpStream);
  }

  private parseQrPayload(raw: string): { id: string; type?: string; hasOdometer?: boolean; requireDescription?: boolean } | null {
    try {
      const parsed = JSON.parse(raw);
      if (!parsed || typeof parsed !== 'object' || typeof parsed.id !== 'string') {
        return null;
      }
      return {
        id: parsed.id,
        type: parsed.type,
        hasOdometer: typeof parsed.hasOdometer === 'boolean' ? parsed.hasOdometer : undefined,
        requireDescription: typeof parsed.requireDescription === 'boolean' ? parsed.requireDescription : undefined
      };
    } catch {
      return null;
    }
  }

  private async startQrScanner() {
    if (!this.qrVideo?.nativeElement || this.qrControls) {
      return;
    }

    this.qrError = undefined;
    this.qrReader = new BrowserMultiFormatReader();
    try {
      this.qrControls = await this.qrReader.decodeFromVideoDevice(undefined, this.qrVideo.nativeElement, (result) => {
        if (!result) {
          return;
        }
        this.handleScanResult(result.getText());
      });
    } catch (error) {
      console.error('QR camera error', error);
      this.qrError = 'Nu pot accesa camera. Verifică permisiunile și HTTPS.';
    }
  }

  private stopQrScanner() {
    this.qrControls?.stop();
    this.qrControls = undefined;
    this.qrReader = undefined;
    const video = this.qrVideo?.nativeElement;
    if (video?.srcObject) {
      (video.srcObject as MediaStream).getTracks().forEach((track) => track.stop());
      video.srcObject = null;
    }
  }

  private handlePhotoPreview() {
    this.toggleCameraForVideo(this.odometerVideo, 'odometer');
    this.toggleCameraForVideo(this.pumpVideo, 'pump');
  }

  private handleQrPreview() {
    const isStep1 = this.isOnStep1();
    if (isStep1 && this.activeTab === 'scan') {
      this.startQrScanner();
    } else {
      this.stopQrScanner();
    }
  }

  private async toggleCameraForVideo(videoRef: ElementRef<HTMLVideoElement> | undefined, type: 'odometer' | 'pump') {
    if (!videoRef?.nativeElement) {
      return;
    }
    const isActive = this.isSlideActive(videoRef.nativeElement);
    if (isActive) {
      await this.ensureStream(videoRef.nativeElement, type);
    } else {
      if (type === 'odometer') {
        this.stopStream(this.odometerStream);
        this.odometerStream = undefined;
      } else {
        this.stopStream(this.pumpStream);
        this.pumpStream = undefined;
      }
    }
  }

  private isSlideActive(element: HTMLElement): boolean {
    const slide = element.closest('swiper-slide');
    return Boolean(slide?.classList.contains('swiper-slide-active'));
  }

  private async ensureStream(video: HTMLVideoElement, type: 'odometer' | 'pump') {
    const existing = type === 'odometer' ? this.odometerStream : this.pumpStream;
    if (existing) {
      return;
    }
    const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } });
    video.srcObject = stream;
    await video.play();
    if (type === 'odometer') {
      this.odometerStream = stream;
    } else {
      this.pumpStream = stream;
    }
  }

  private stopStream(stream?: MediaStream) {
    stream?.getTracks().forEach((track) => track.stop());
  }

  private captureFrame(video: HTMLVideoElement): string | undefined {
    if (!video.videoWidth || !video.videoHeight) {
      return undefined;
    }
    const canvas = document.createElement('canvas');
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const ctx = canvas.getContext('2d');
    if (!ctx) {
      return undefined;
    }
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    return canvas.toDataURL('image/jpeg', 0.9);
  }

  async captureOdometerAndContinue() {
    if (!this.odometerVideo?.nativeElement) {
      return;
    }
    await this.ensureStream(this.odometerVideo.nativeElement, 'odometer');
    this.odometerPhotoData = this.captureFrame(this.odometerVideo.nativeElement);
    this.stopStream(this.odometerStream);
    this.odometerStream = undefined;
    this.nextSlide();
  }

  async capturePumpAndContinue() {
    if (!this.pumpVideo?.nativeElement) {
      return;
    }
    await this.ensureStream(this.pumpVideo.nativeElement, 'pump');
    this.pumpPhotoData = this.captureFrame(this.pumpVideo.nativeElement);
    this.stopStream(this.pumpStream);
    this.pumpStream = undefined;
    this.nextSlide();
  }

  private loadCars() {
    this.isLoadingCars = true;
    this.carService.getAll(1, 100).subscribe({
      next: (data) => {
        this.cars = data.getModels() ?? [];
        this.filterCars();
        this.isLoadingCars = false;
      },
      error: () => {
        this.isLoadingCars = false;
        this.qrError = 'Nu pot încărca lista de vehicule.';
      }
    });
  }

  private loadWarehouses() {
    this.isLoadingWarehouses = true;
    this.warehouseService.getAll(1, 100).subscribe({
      next: (data) => {
        this.warehouses = data.getModels() ?? [];
        this.filterWarehouses();
        if (this.fuelModel.warehouseId) {
          this.setOriginWarehouseById(this.fuelModel.warehouseId);
        }
        if (this.fuelModel.destinationWarehouseId) {
          this.setDestinationWarehouseById(this.fuelModel.destinationWarehouseId);
        }
        this.isLoadingWarehouses = false;
      },
      error: () => {
        this.isLoadingWarehouses = false;
        this.qrError = 'Nu pot încărca lista de depozite.';
      }
    });
  }

  private filterCars() {
    const term = this.carSearch.trim().toLowerCase();
    if (!term) {
      this.filteredCars = [...this.cars];
      this.updateCombinedList();
      return;
    }
    this.filteredCars = this.cars.filter((car) => {
      const license = (car.licensePlate ?? '').toLowerCase();
      const description = (car.description ?? '').toLowerCase();
      return license.includes(term) || description.includes(term);
    });
    this.updateCombinedList();
  }

  onWarehouseSearch(event: CustomEvent) {
    const value = (event.detail?.value ?? '').toString();
    this.warehouseSearch = value;
    this.filterWarehouses();
  }

  private filterWarehouses() {
    const term = this.warehouseSearch.trim().toLowerCase();
    const originId = this.fuelModel.warehouseId;
    const baseList = this.warehouses.filter((warehouse) => warehouse.id !== originId);
    if (!term) {
      this.filteredWarehouses = baseList;
      this.updateCombinedList();
      return;
    }
    this.filteredWarehouses = baseList.filter((warehouse) => {
      const name = (warehouse.name ?? '').toLowerCase();
      return name.includes(term);
    });
    this.updateCombinedList();
  }

  private updateCombinedList() {
    const cars = this.filteredCars.map((car) => {
      const license = car.licensePlate ?? '';
      const description = car.description ?? '';
      const title = license || description || 'Fără număr';
      const sortKey = (license || description || '').toLowerCase();
      return {
        type: 'car' as const,
        title,
        subtitle: description && description !== title ? description : undefined,
        sortKey,
        car
      };
    });
    const warehouses = this.filteredWarehouses.map((warehouse) => {
      const name = warehouse.name ?? 'Fără nume';
      return {
        type: 'warehouse' as const,
        title: name,
        sortKey: name.toLowerCase(),
        warehouse
      };
    });
    this.combinedList = [...cars, ...warehouses].sort((a, b) =>
      a.sortKey.localeCompare(b.sortKey, 'ro', { sensitivity: 'base' })
    );
  }

  isStep1Valid(): boolean {
    if (!this.fuelModel.warehouseId) {
      return false;
    }
    const hasCar = Boolean(this.fuelModel.carId);
    const hasDestination = Boolean(this.fuelModel.destinationWarehouseId);
    return (hasCar && !hasDestination) || (!hasCar && hasDestination);
  }

  private tryAdvanceFromStep1() {
    if (this.isStep1Valid()) {
      if (!this.isOnStep1()) {
        this.nextSlide();
      }
    }
  }

  private isOnStep1(): boolean {
    const swiperEl = this.fillSwiper?.nativeElement as any;
    const activeIndex = swiperEl?.swiper?.activeIndex ?? 0;
    const step1Index = this.fuelModel.warehouseId ? 0 : 1;
    return activeIndex === step1Index;
  }

  private async handleScanResult(raw: string) {
    if (!raw) {
      return;
    }
    const now = Date.now();
    if (now - this.lastScanAt < this.scanCooldownMs) {
      return;
    }
    this.lastScanAt = now;
    this.qrError = undefined;
    const payload = this.parseQrPayload(raw);
    if (payload?.id) {
      this.applyQrPayload(payload);
      return;
    }
    await this.handlePumpCode(raw);
  }

  private async handlePumpCode(raw: string) {
    if (this.isResolvingPump) {
      return;
    }
    this.isResolvingPump = true;
    try {
      const warehouseId = await this.resolveWarehouseIdFromCode(raw);
      if (!warehouseId) {
        this.qrError = 'QR-ul nu conține un URL valid pentru pompă.';
        return;
      }
      this.fuelModel.destinationWarehouseId = warehouseId;
      this.setDestinationWarehouseById(warehouseId);
      this.tryAdvanceFromStep1();
    } finally {
      this.isResolvingPump = false;
    }
  }

  private setDestinationWarehouseById(id: string) {
    const found = this.warehouses.find((warehouse) => warehouse.id === id);
    this.destinationWarehouse = found;
  }

  private setOriginWarehouseById(id: string) {
    const found = this.warehouses.find((warehouse) => warehouse.id === id);
    this.originWarehouse = found;
  }

  private async resolveWarehouseIdFromCode(raw: string): Promise<string | null> {
    const trimmed = raw.trim();
    if (!trimmed) {
      return null;
    }
    const directId = this.extractWarehouseIdFromUrl(trimmed);
    if (directId) {
      return directId;
    }
    if (!this.looksLikeUrl(trimmed)) {
      return trimmed;
    }
    const normalizedUrl = this.normalizeUrl(trimmed);
    if (!normalizedUrl) {
      return null;
    }
    const resolvedUrl = await this.followRedirect(normalizedUrl);
    if (!resolvedUrl) {
      return null;
    }
    return this.extractWarehouseIdFromUrl(resolvedUrl);
  }

  private extractWarehouseIdFromUrl(text: string): string | null {
    const match = text.match(/fill-gas\/([^/?#]+)/i);
    return match?.[1] ?? null;
  }

  private looksLikeUrl(text: string): boolean {
    return /^https?:\/\//i.test(text) || /[a-z0-9.-]+\.[a-z]{2,}/i.test(text);
  }

  private normalizeUrl(text: string): string | null {
    if (/^https?:\/\//i.test(text)) {
      return text;
    }
    if (text.includes('localhost')) {
      return `http://${text}`;
    }
    return `https://${text}`;
  }

  private async followRedirect(url: string): Promise<string | null> {
    try {
      const response = await fetch(url, { method: 'HEAD', redirect: 'follow' });
      if (response.url) {
        return response.url;
      }
    } catch {
      // ignore
    }
    try {
      const response = await fetch(url, { method: 'GET', redirect: 'follow' });
      return response.url || null;
    } catch {
      return null;
    }
  }
}
