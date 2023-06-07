import { ActivatedRouteSnapshot, ResolveFn, RouterStateSnapshot } from '@angular/router';
import { BaseModel, BaseService } from '../core';

export function DynamicallyServiceResolver<T extends BaseModel, U extends BaseService<T>>(serviceImport: any, serviceName: string): ResolveFn<U> {
  return (route: ActivatedRouteSnapshot, state: RouterStateSnapshot) => {
    const instance = getInstance<U>(serviceName, serviceImport);
    if (!instance) {
      throw new Error(`Invalid className: ${serviceName}`);
    }
    return instance;
  };
}

function getInstance<U>(serviceName: string, serviceImport: any): Promise<U> {
  return serviceImport.then((module) => module[toProperCase(serviceName)]);  // return Promise.all([serviceImport]).then(
  //   (module) => ({
  //     serviceInstance: module[toProperCase(serviceName)],
  //   })
  // );
}

function toProperCase(str: string): string {
  return str.replace(/\w\S*/g, (txt: string) => {
    return txt.charAt(0).toUpperCase() + txt.substring(1).toLowerCase();
  });
}
