import { CommonModule } from '@angular/common';
import { AfterViewInit, Component, CUSTOM_ELEMENTS_SCHEMA, ElementRef, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import {
  IonButton,
  IonContent,
  IonIcon,
  IonInput,
  IonItem,
  IonLabel,
  IonList,
  IonSearchbar,
  IonSegment,
  IonSegmentButton,
  IonSpinner,
  IonTextarea
} from '@ionic/angular/standalone';
import { AuthService, FileService } from '@rosoftlab/core';
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
import { forkJoin, map, of, switchMap } from 'rxjs';
import { Car } from '../../services/car/car';
import { CarService } from '../../services/car/car.service';
import { FuelTransaction } from '../../services/fuel-transaction/fuel-transaction';
import { FuelTransactionService } from '../../services/fuel-transaction/fuel-transaction.service';
import { Warehouse } from '../../services/warehouse/warehouse';
import { WarehouseService } from '../../services/warehouse/warehouse.service';
import { OfflineTransactionQueueService } from '../../shared/offline-transaction-queue.service';

@Component({
  selector: 'app-fill-gas',
  templateUrl: './fill-gas.component.html',
  styleUrls: ['./fill-gas.component.scss'],
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    IonContent,
    IonButton,
    IonIcon,
    IonList,
    IonItem,
    IonLabel,
    IonInput,
    IonTextarea,
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

  form = new FormGroup({
    kilometersOrHours: new FormControl<number | null>(null),
    liters: new FormControl<number | null>(null, Validators.required),
    description: new FormControl<string | null>(null)
  });
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
  forceAllPhotos = true;
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
  torchAvailable = false;
  torchEnabled = false;

  fuelModel: FuelTransaction = new FuelTransaction();

  isProcessing = false;

  constructor(
    private carService: CarService,
    private warehouseService: WarehouseService,
    private authService: AuthService,
    private fileService: FileService,
    private offlineTransactions: OfflineTransactionQueueService,
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
    this.form.valueChanges.subscribe((value) => {
      this.fuelModel.kilometersOrHours = value.kilometersOrHours ?? undefined;
      this.fuelModel.liters = value.liters ?? undefined;
      this.fuelModel.description = value.description ?? undefined;
    });
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
    this.updatePhotoRequirements();
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
    this.updatePhotoRequirements();
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
    this.updatePhotoRequirements();
    this.buildFormFields();
  }

  buildFormFields() {
    const kmCtrl = this.form.get('kilometersOrHours');
    const litersCtrl = this.form.get('liters');
    const descCtrl = this.form.get('description');

    if (kmCtrl) {
      kmCtrl.setValidators(this.hasOdometer ? [Validators.required] : []);
      if (!this.hasOdometer) {
        kmCtrl.reset();
        kmCtrl.disable({ emitEvent: false });
      } else {
        kmCtrl.enable({ emitEvent: false });
      }
      kmCtrl.updateValueAndValidity({ emitEvent: false });
    }

    if (litersCtrl) {
      litersCtrl.setValidators([Validators.required]);
      litersCtrl.updateValueAndValidity({ emitEvent: false });
    }

    if (descCtrl) {
      descCtrl.setValidators(this.requireDescription ? [Validators.required] : []);
      if (!this.requireDescription) {
        descCtrl.reset();
      }
      descCtrl.updateValueAndValidity({ emitEvent: false });
    }
  }

  private updatePhotoRequirements() {
    if (this.forceAllPhotos) {
      this.showOdometerPhotoSlide = this.hasOdometer;
      this.showPumpPhotoSlide = true;
      return;
    }

    // Default deterministic rules:
    // - odometer photo only if the vehicle has odometer
    // - pump photo if description is required (audit)
    this.showOdometerPhotoSlide = this.hasOdometer;
    this.showPumpPhotoSlide = this.requireDescription;
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
    this.fuelModel.kilometersOrHours = this.form.get('kilometersOrHours')?.value ?? undefined;
    this.fuelModel.liters = this.form.get('liters')?.value ?? undefined;
    this.fuelModel.description = this.form.get('description')?.value ?? undefined;
    this.fuelModel.carId = this.vehicleId ?? this.fuelModel.carId;
    this.fuelModel.transactionDate = this.fuelModel.transactionDate ?? new Date();
    const isOffline = typeof navigator !== 'undefined' && !navigator.onLine;
    if (isOffline) {
      this.offlineTransactions
        .enqueue(this.fuelModel, this.odometerPhotoData, this.pumpPhotoData)
        .then(() => {
          this.resetAfterSave();
          alert('Alimentarea a fost salvată offline și va fi trimisă când revii online.');
        })
        .catch(() => {
          this.isProcessing = false;
          alert('Nu am putut salva alimentarea offline. Încearcă din nou.');
        });
      return;
    }

    const uploadTasks = this.buildPhotoUploads();
    const save$ = uploadTasks.length
      ? forkJoin(uploadTasks).pipe(
          map((results) => {
            results.forEach((result) => {
              if (result.kind === 'odometer' && result.file?.id) {
                this.fuelModel.odometerPhotoId = result.file.id;
              }
              if (result.kind === 'pump' && result.file?.id) {
                this.fuelModel.fuelPumpPhotoId = result.file.id;
              }
            });
            return this.fuelModel;
          }),
          switchMap((model) => this.fuelTransactionService.save(model))
        )
      : this.fuelTransactionService.save(this.fuelModel);

    save$.subscribe({
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

  private buildPhotoUploads() {
    const uploads: Array<ReturnType<typeof this.createUpload>> = [];
    if (this.odometerPhotoData) {
      uploads.push(this.createUpload(this.odometerPhotoData, 'odometer'));
    }
    if (this.pumpPhotoData) {
      uploads.push(this.createUpload(this.pumpPhotoData, 'pump'));
    }
    return uploads;
  }

  private createUpload(dataUrl: string, kind: 'odometer' | 'pump') {
    const blobInfo = this.dataUrlToBlob(dataUrl);
    if (!blobInfo) {
      return of({ kind, file: null as any });
    }
    const { blob, extension } = blobInfo;
    const name = `${kind}-${Date.now()}.${extension}`;
    return this.fileService.upload(blob, name).pipe(map((file) => ({ kind, file })));
  }

  private dataUrlToBlob(dataUrl: string): { blob: Blob; extension: string } | null {
    const match = dataUrl.match(/^data:([^;]+);base64,(.+)$/);
    if (!match) {
      return null;
    }
    const mime = match[1];
    const b64 = match[2];
    const byteStr = atob(b64);
    const len = byteStr.length;
    const bytes = new Uint8Array(len);
    for (let i = 0; i < len; i++) {
      bytes[i] = byteStr.charCodeAt(i);
    }
    const extension = mime.split('/')[1] || 'jpg';
    return { blob: new Blob([bytes], { type: mime }), extension };
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
      await this.checkTorchAvailability(this.qrVideo.nativeElement);
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

  async toggleTorch() {
    if (!this.qrVideo?.nativeElement) {
      return;
    }
    const stream = this.qrVideo.nativeElement.srcObject as MediaStream | null;
    const track = stream?.getVideoTracks?.()[0];
    if (!track) {
      return;
    }
    try {
      this.torchEnabled = !this.torchEnabled;
      await track.applyConstraints({
        advanced: [{ torch: this.torchEnabled }]
      } as any);
    } catch (error) {
      console.warn('Torch not supported', error);
      this.torchEnabled = false;
    }
  }

  private async checkTorchAvailability(video: HTMLVideoElement) {
    const stream = video.srcObject as MediaStream | null;
    const track = stream?.getVideoTracks?.()[0];
    if (!track) {
      this.torchAvailable = false;
      return;
    }
    const capabilities = (track.getCapabilities && track.getCapabilities()) as any;
    this.torchAvailable = Boolean(capabilities && capabilities.torch);
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
    const baseList = this.warehouses
      .filter((warehouse) => warehouse.id !== originId)
      .sort((a, b) => (a.name ?? '').localeCompare(b.name ?? '', 'ro', { sensitivity: 'base' }));
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
