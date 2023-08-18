import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BaseDatastore, BaseDatastoreConfig, CacheService, DatastoreConfig } from '@rosoftlab/core';
import { environment } from '../../environments/environment';

const config: DatastoreConfig = {
    baseUrl: environment.baseUrl,
    apiVersion: 'api/v1'
};

@Injectable()
@BaseDatastoreConfig(config)
export class Datastore extends BaseDatastore {
    constructor(http: HttpClient,
        cacheService:CacheService) {
        super(http,cacheService);
    }
}
