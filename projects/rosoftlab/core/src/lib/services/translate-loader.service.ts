import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { TranslateLoader } from '@ngx-translate/core';
import { Observable } from 'rxjs';
import { Configurations } from '../configurations';
@Injectable({
  providedIn: 'root'
})
export class TranslateloaderService implements TranslateLoader {
  private _apiUrl = '';
  private headers: any = new HttpHeaders({
    Accept: 'application/json',
    'Content-Type': 'application/json'
  });
  constructor(private httpClient: HttpClient,
    config: Configurations) {
    console.log(config)
    if (config) {
      this._apiUrl = config.baseUrl;
    }
  }
  getTranslation(lang: string): Observable<any> {
    const url = this._apiUrl + '/api/v1/language/' + lang + '/translationlist';
    return this.httpClient.get(url, { headers: this.headers });
  }

}
