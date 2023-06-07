import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { TranslateLoader } from '@ngx-translate/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
@Injectable({
  providedIn: 'root'
})
export class TranslateloaderService implements TranslateLoader {
  private apiUrl = environment.baseUrl;
  private headers: any = new HttpHeaders({
    Accept: 'application/json',
    'Content-Type': 'application/json'
  });
  constructor(private httpClient: HttpClient) {

  }
  getTranslation(lang: string): Observable<any> {
    const url = this.apiUrl + '/api/v1/language/' + lang + '/translationlist';
    return this.httpClient.get(url, { headers: this.headers });
  }

}
