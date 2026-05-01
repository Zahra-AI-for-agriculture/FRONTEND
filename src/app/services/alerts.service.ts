import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { Alert, UnreadCount, AlertReport, TreatmentWindow } from '../models';

@Injectable({ providedIn: 'root' })
export class AlertsService {

  private readonly API = 'http://localhost:8000/api/v1/alerts';

  constructor(private http: HttpClient) {}

  getAlerts(): Observable<Alert[]> {
    return this.http.get<Alert[]>(this.API).pipe(
      catchError(err => throwError(() => err))
    );
  }

  getUnreadCount(): Observable<UnreadCount> {
    return this.http.get<UnreadCount>(`${this.API}/unread-count`).pipe(
      catchError(err => throwError(() => err))
    );
  }

  markAsRead(id: number): Observable<unknown> {
    return this.http.put(`${this.API}/${id}/read`, {}).pipe(
      catchError(err => throwError(() => err))
    );
  }

  reportAlert(data: AlertReport): Observable<unknown> {
    return this.http.post(`${this.API}/report`, data).pipe(
      catchError(err => throwError(() => err))
    );
  }

  getCommunityAlerts(governorate: string): Observable<Alert[]> {
    return this.http.get<Alert[]>(`${this.API}/community/${governorate}`).pipe(
      catchError(err => throwError(() => err))
    );
  }

  getTreatmentWindow(parcelId: number): Observable<TreatmentWindow> {
    return this.http.get<TreatmentWindow>(`${this.API}/treatment-window/${parcelId}`).pipe(
      catchError(err => throwError(() => err))
    );
  }
}
