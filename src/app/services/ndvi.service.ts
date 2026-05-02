import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { NDVIResult, NDVIHistory, NDVICompare, NDVICoverage } from '../models';

@Injectable({ providedIn: 'root' })
export class NDVIService {

  private readonly API = 'http://localhost:8000/api/v1/ndvi';

  constructor(private http: HttpClient) {}

  getNDVI(parcelId: number): Observable<NDVIResult> {
    return this.http.get<NDVIResult>(`${this.API}/parcel/${parcelId}`).pipe(
      catchError(err => throwError(() => err))
    );
  }

  getNDVIHistory(parcelId: number): Observable<NDVIHistory> {
    return this.http.get<NDVIHistory>(`${this.API}/parcel/${parcelId}/history`).pipe(
      catchError(err => throwError(() => err))
    );
  }

  getNDVICompare(parcelId: number): Observable<NDVICompare> {
    return this.http.get<NDVICompare>(`${this.API}/parcel/${parcelId}/compare`).pipe(
      catchError(err => throwError(() => err))
    );
  }

  getRegionNDVI(governorate: string): Observable<NDVIResult[]> {
    return this.http.get<NDVIResult[]>(`${this.API}/region/${governorate}`).pipe(
      catchError(err => throwError(() => err))
    );
  }

  getNDVICoverage(parcelId: number): Observable<NDVICoverage> {
    return this.http.get<NDVICoverage>(`${this.API}/parcel/${parcelId}/coverage`).pipe(
      catchError(err => throwError(() => err))
    );
  }
}
