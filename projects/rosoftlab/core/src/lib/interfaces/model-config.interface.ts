import { BaseMetaModel } from '../models/base-meta.model';

export interface ModelConfig {
  type: string;
  apiVersion?: string;
  baseUrl?: string;
  modelEndpointUrl?: string;
  meta?: BaseMetaModel;
  formTitle: string;
  bypassCache?: boolean;
}
