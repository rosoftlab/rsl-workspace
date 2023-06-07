import { Injectable } from '@angular/core';

@Injectable()
export class StorageService {
    private sessionStorage: any;
    private localStorage: any;

    constructor() {
        this.sessionStorage = sessionStorage; // localStorage;
        this.localStorage = localStorage; // localStorage;
    }

    public retrieve(key: string, localStorage: boolean = false): any {

        const storage: any = localStorage ? this.localStorage : this.sessionStorage;
        const item = storage.getItem(key);

        if (item && item !== 'undefined') {
            return JSON.parse(storage.getItem(key));
        }

        return;
    }

    public store(key: string, value: any, localStorage: boolean = false) {
        const storage: any = localStorage ? this.localStorage : this.sessionStorage;
        storage.setItem(key, JSON.stringify(value));
    }
    public remove(key: string, localStorage: boolean = false) {
        const storage: any = localStorage ? this.localStorage : this.sessionStorage;
        storage.removeItem(key)
    }
}
