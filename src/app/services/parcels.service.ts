import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { Parcel, ParcelHistory, HealthScore } from '../models';

@Injectable({ providedIn: 'root' })
export class ParcelsService {

  private readonly API = 'http://localhost:8000/api/v1/parcels';

  constructor(private http: HttpClient) {}

  getParcels(): Observable<Parcel[]> {
    return this.http.get<Parcel[]>(this.API).pipe(
      catchError(err => throwError(() => err))
    );
  }

  getParcel(id: number): Observable<Parcel> {
    return this.http.get<Parcel>(`${this.API}/${id}`).pipe(
      catchError(err => throwError(() => err))
    );
  }

  createParcel(data: Partial<Parcel>): Observable<Parcel> {
    return this.http.post<Parcel>(this.API, data).pipe(
      catchError(err => throwError(() => err))
    );
  }

  updateParcel(id: number, data: Partial<Parcel>): Observable<Parcel> {
    return this.http.put<Parcel>(`${this.API}/${id}`, data).pipe(
      catchError(err => throwError(() => err))
    );
  }

  deleteParcel(id: number): Observable<unknown> {
    return this.http.delete(`${this.API}/${id}`).pipe(
      catchError(err => throwError(() => err))
    );
  }

  getParcelHistory(id: number): Observable<ParcelHistory[]> {
    return this.http.get<ParcelHistory[]>(`${this.API}/${id}/history`).pipe(
      catchError(err => throwError(() => err))
    );
  }

  addParcelHistory(id: number, data: Partial<ParcelHistory>): Observable<ParcelHistory> {
    return this.http.post<ParcelHistory>(`${this.API}/${id}/history`, data).pipe(
      catchError(err => throwError(() => err))
    );
  }

  getHealthScore(id: number): Observable<HealthScore> {
    return this.http.get<HealthScore>(`${this.API}/${id}/health-score`).pipe(
      catchError(err => throwError(() => err))
    );
  }
}
