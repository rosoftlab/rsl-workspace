import { Injectable } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { FileService } from '@rosoftlab/core';
import { FuelTransaction } from '../services/fuel-transaction/fuel-transaction';
import { FuelTransactionService } from '../services/fuel-transaction/fuel-transaction.service';

type OfflineTransactionPayload = {
  id?: number;
  model: Record<string, any>;
  odometerPhotoData?: string;
  pumpPhotoData?: string;
  createdAt: number;
};

@Injectable({ providedIn: 'root' })
export class OfflineTransactionQueueService {
  private db?: IDBDatabase;
  private isFlushing = false;

  constructor(
    private fuelTransactionService: FuelTransactionService,
    private fileService: FileService
  ) {}

  init() {
    if (typeof window === 'undefined') {
      return;
    }
    window.addEventListener('online', () => {
      this.flush().catch(() => undefined);
    });
    this.flush().catch(() => undefined);
  }

  async enqueue(model: FuelTransaction, odometerPhotoData?: string, pumpPhotoData?: string) {
    const db = await this.getDb();
    const payload: OfflineTransactionPayload = {
      model: { ...model },
      odometerPhotoData,
      pumpPhotoData,
      createdAt: Date.now()
    };
    await new Promise<void>((resolve, reject) => {
      const tx = db.transaction('transactions', 'readwrite');
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
      tx.objectStore('transactions').add(payload);
    });
  }

  async flush() {
    if (this.isFlushing || !this.isOnline()) {
      return;
    }
    this.isFlushing = true;
    try {
      const db = await this.getDb();
      const items = await this.getAll(db);
      for (const item of items) {
        try {
          const model = this.fuelTransactionService.newModel(item.model);
          if (item.odometerPhotoData) {
            const file = await firstValueFrom(
              this.fileService.upload(this.dataUrlToBlob(item.odometerPhotoData).blob, `odometer-${Date.now()}.jpg`)
            );
            model.odometerPhotoId = file?.id;
          }
          if (item.pumpPhotoData) {
            const file = await firstValueFrom(
              this.fileService.upload(this.dataUrlToBlob(item.pumpPhotoData).blob, `pump-${Date.now()}.jpg`)
            );
            model.fuelPumpPhotoId = file?.id;
          }
          await firstValueFrom(this.fuelTransactionService.save(model));
          await this.delete(db, item.id!);
        } catch {
          // keep queued
        }
      }
    } finally {
      this.isFlushing = false;
    }
  }

  private isOnline(): boolean {
    return typeof navigator === 'undefined' ? true : navigator.onLine;
  }

  private async getDb(): Promise<IDBDatabase> {
    if (this.db) {
      return this.db;
    }
    const db = await new Promise<IDBDatabase>((resolve, reject) => {
      const request = indexedDB.open('fixfuel-offline', 2);
      request.onupgradeneeded = () => {
        const database = request.result;
        if (!database.objectStoreNames.contains('transactions')) {
          database.createObjectStore('transactions', { keyPath: 'id', autoIncrement: true });
        }
      };
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
    this.db = db;
    return db;
  }

  private async getAll(db: IDBDatabase): Promise<OfflineTransactionPayload[]> {
    return await new Promise<OfflineTransactionPayload[]>((resolve, reject) => {
      const tx = db.transaction('transactions', 'readonly');
      const store = tx.objectStore('transactions');
      const req = store.getAll();
      req.onsuccess = () => resolve(req.result as OfflineTransactionPayload[]);
      req.onerror = () => reject(req.error);
    });
  }

  private async delete(db: IDBDatabase, id: number) {
    await new Promise<void>((resolve, reject) => {
      const tx = db.transaction('transactions', 'readwrite');
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
      tx.objectStore('transactions').delete(id);
    });
  }

  private dataUrlToBlob(dataUrl: string): { blob: Blob } {
    const match = dataUrl.match(/^data:([^;]+);base64,(.+)$/);
    if (!match) {
      return { blob: new Blob([]) };
    }
    const mime = match[1];
    const b64 = match[2];
    const byteStr = atob(b64);
    const bytes = new Uint8Array(byteStr.length);
    for (let i = 0; i < byteStr.length; i++) {
      bytes[i] = byteStr.charCodeAt(i);
    }
    return { blob: new Blob([bytes], { type: mime }) };
  }
}
