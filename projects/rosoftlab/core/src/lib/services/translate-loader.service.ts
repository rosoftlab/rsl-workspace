import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable, Optional } from '@angular/core';
import { TranslateLoader } from '@ngx-translate/core';
import { Observable } from 'rxjs';
import { Configurations } from '../configurations';
@Injectable({
  providedIn: 'root'
})
export class TranslateloaderService implements TranslateLoader {
  private _apiUrl = 'No Value';
  private headers: any = new HttpHeaders({
    Accept: 'application/json',
    'Content-Type': 'application/json'
  });
  constructor(private httpClient: HttpClient,
    @Optional() config?: Configurations) {
    if (config) {
      this._apiUrl = config.baseUrl;
    }
  }
  getTranslation(lang: string): Observable<any> {
    const url = this._apiUrl + '/api/v1/language/' + lang + '/translationlist';
    return this.httpClient.get(url, { headers: this.headers });
  }

}
