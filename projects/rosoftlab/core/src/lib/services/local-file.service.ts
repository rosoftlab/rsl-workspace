
import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, ReplaySubject } from 'rxjs';
import { tap } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class LocalFileService {
  private cache: Map<string, ReplaySubject<any>> = new Map();

  constructor(private http: HttpClient) { }

  getJsonData(jsonUrl: string): Observable<any> {
    if (this.cache.has(jsonUrl)) {
      return this.cache.get(jsonUrl)!.asObservable(); // Return cached data if available
    }

    const dataSubject = new ReplaySubject<any>(1); // Store the latest value
    this.cache.set(jsonUrl, dataSubject);

    this.http.get<any>(jsonUrl).pipe(
      tap(data => dataSubject.next(data)) // Cache the fetched data
    ).subscribe({
      next: data => console.log('Data loaded for', jsonUrl),
      error: err => console.error('Error loading JSON:', err)
    });

    return dataSubject.asObservable(); // Return observable
  }
}
