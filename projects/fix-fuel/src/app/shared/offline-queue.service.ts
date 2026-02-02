import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { firstValueFrom } from 'rxjs';

export type OfflineQueuedRequest = {
  id?: number;
  url: string;
  method: string;
  body: unknown;
  headers?: Record<string, string>;
  createdAt: number;
};

type QueueStore = {
  db: IDBDatabase;
};

@Injectable({ providedIn: 'root' })
export class OfflineQueueService {
  private store?: QueueStore;
  private isFlushing = false;
  private readonly skipHeader = 'x-offline-queued';

  constructor(private http: HttpClient) {}

  init() {
    if (typeof window === 'undefined') {
      return;
    }
    window.addEventListener('online', () => {
      this.flush().catch(() => undefined);
    });
    // Best-effort flush on startup.
    this.flush().catch(() => undefined);
  }

  async enqueue(request: OfflineQueuedRequest) {
    const db = await this.getDb();
    await new Promise<void>((resolve, reject) => {
      const tx = db.transaction('requests', 'readwrite');
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
      const store = tx.objectStore('requests');
      store.add(request);
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
          const headers = new HttpHeaders({
            ...(item.headers || {}),
            [this.skipHeader]: '1',
          });
          await firstValueFrom(
            this.http.request(item.method, item.url, {
              body: item.body,
              headers,
            })
          );
          await this.delete(db, item.id!);
        } catch {
          // Keep in queue if request still fails.
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
    if (this.store?.db) {
      return this.store.db;
    }
    const db = await new Promise<IDBDatabase>((resolve, reject) => {
      const request = indexedDB.open('fixfuel-offline', 2);
      request.onupgradeneeded = () => {
        const database = request.result;
        if (!database.objectStoreNames.contains('requests')) {
          database.createObjectStore('requests', { keyPath: 'id', autoIncrement: true });
        }
        if (!database.objectStoreNames.contains('transactions')) {
          database.createObjectStore('transactions', { keyPath: 'id', autoIncrement: true });
        }
      };
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
    this.store = { db };
    return db;
  }

  private async getAll(db: IDBDatabase): Promise<OfflineQueuedRequest[]> {
    return await new Promise<OfflineQueuedRequest[]>((resolve, reject) => {
      const tx = db.transaction('requests', 'readonly');
      const store = tx.objectStore('requests');
      const req = store.getAll();
      req.onsuccess = () => resolve(req.result as OfflineQueuedRequest[]);
      req.onerror = () => reject(req.error);
    });
  }

  private async delete(db: IDBDatabase, id: number) {
    await new Promise<void>((resolve, reject) => {
      const tx = db.transaction('requests', 'readwrite');
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
      tx.objectStore('requests').delete(id);
    });
  }
}
