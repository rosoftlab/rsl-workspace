import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { TranslateLoader } from '@ngx-translate/core';
import { environment } from 'projects/rdict-example/src/environments/environment';
import { Observable } from 'rxjs';
@Injectable({
  providedIn: 'root'
})
export class TranslateloaderService implements TranslateLoader {
  private _apiUrl = environment.baseUrl;
  private headers: any = new HttpHeaders({
    Accept: 'application/json',
    'Content-Type': 'application/json'
  });
  constructor(private httpClient: HttpClient) {
  }
  getTranslation(lang: string): Observable<any> {
    const url = this._apiUrl + '/api/v1/language/' + lang + '/translationlist';
    return this.httpClient.get(url, { headers: this.headers });
  }

}
