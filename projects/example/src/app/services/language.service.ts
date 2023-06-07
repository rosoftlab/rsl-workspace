
import { Injectable } from '@angular/core';
import { BaseService } from '@rosoftlab/core';
import { Observable } from 'rxjs';
import { Language } from '../models/administration/language';
import { Datastore } from './datastore.service';

@Injectable({
  providedIn: 'root'
})
export class LanguageService extends BaseService<Language> {
  languages: Language[] | undefined;
  missingTranslations: string[] | undefined;
  constructor(datastore: Datastore) {
    super(datastore);
    this.setModelType(Language);
  }
  public GetCachedLanguages(): Observable<Language[]> {

    return new Observable((observer) => {
      if (this.languages) {
        observer.next(this.languages);
        observer.complete();
      } else {
        this.getAll(1, 1000).subscribe(models => {
          this.languages = models.getModels();
          observer.next(this.languages);
          observer.complete();
        });
      }
    });
  }
  public addMissingTranslation(languageCode: string, key: string): Observable<boolean> {
    if (this.missingTranslations == undefined)
      this.missingTranslations = [];
    if (this.missingTranslations.findIndex(f => f == key) === -1) {
      this.missingTranslations.push(key);
      const customUrl = this.datastore.buildUrl(Language) + '/' + languageCode + '/missingtranslation';
      return this.postCustom<boolean>(null, { key }, undefined, customUrl);
    } else {
      return new Observable((observer) => {
        observer.next(true);
        observer.complete();
      });
    }
  }
}
