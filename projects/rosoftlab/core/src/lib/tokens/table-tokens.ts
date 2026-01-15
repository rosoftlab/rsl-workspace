import { InjectionToken, Type } from '@angular/core';
import { BaseModel } from '../models/base.model';
import { BaseService } from '../services/base.service';
export const MODEL_SERVICE = new InjectionToken<BaseService<BaseModel>>('MODEL_SERVICE');
export const MODEL_TOKEN = new InjectionToken<Type<BaseModel>>('MODEL_TOKEN');
// This token will store a map of string keys to Component Classes
export const TABLE_IMPLEMENTATIONS_TOKEN = new InjectionToken<Record<string, Type<any>>>('TABLE_IMPLEMENTATIONS_TOKEN');
export const CRUD_IMPLEMENTATIONS_TOKEN = new InjectionToken<Record<string, Type<any>>>('CRUD_IMPLEMENTATIONS_TOKEN');
