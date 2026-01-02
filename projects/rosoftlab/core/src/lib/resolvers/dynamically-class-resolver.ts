import { ActivatedRouteSnapshot, ResolveFn, RouterStateSnapshot } from '@angular/router';
import { BaseModel } from '../models/base.model';

export function DynamicallyModelResolver<T extends BaseModel>(modelsImport: any, className: string | undefined = undefined): ResolveFn<T> {
    return (route: ActivatedRouteSnapshot, state: RouterStateSnapshot) => {
        if (className == undefined)
            className = route.paramMap.get('className');
        const instance = getInstance<T>(className, modelsImport);
        if (!instance) {
            throw new Error(`Invalid className: ${className}`);
        }
        return instance;
    };
}

function getInstance<T>(className: string, modelsImport: any): Promise<T> {
    return modelsImport.then((module) => module[toProperCase(className)]);
    // return modelsImport.then((module) => ({ modelInstance: module[toProperCase(className)] })
    // );
}

function toProperCase(str: string): string {
    return str.replace(/\w\S*/g, (txt: string) => {
        return txt.charAt(0).toUpperCase() + txt.substring(1).toLowerCase();
    });
}
