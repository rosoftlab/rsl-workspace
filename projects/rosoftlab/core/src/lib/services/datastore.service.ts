import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Configurations } from '../configurations';
import { BaseDatastoreConfig, DatastoreConfig } from '../core';
import { BaseDatastore } from './base-datastore.service';
import { CacheService } from './cache.service';


@Injectable()
@BaseDatastoreConfig({ apiVersion: '', baseUrl: '' })
export class DatastoreCore extends BaseDatastore {
    private customConfig: DatastoreConfig
    constructor(http: HttpClient, cacheService: CacheService, private configExt: Configurations) {
        super(http, cacheService);
        this.customConfig = {
            apiVersion: this.configExt.apiVersion,
            baseUrl:  this.configExt.baseUrl
        };
        this.config = this.customConfig;
    }
}
