import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { NotificationPreferences, NotificationHistory } from '../models';

@Injectable({ providedIn: 'root' })
export class NotificationsService {
  private readonly API = 'http://20.240.59.225:8000/api/v1/notifications';
  constructor(private http: HttpClient) {}

  registerDevice(fcmToken: string): Observable<unknown> {
    return this.http.post(`${this.API}/register-device`, { fcm_token: fcmToken }).pipe(catchError(err => throwError(() => err)));
  }

  updatePreferences(data: NotificationPreferences): Observable<NotificationPreferences> {
    return this.http.put<NotificationPreferences>(`${this.API}/preferences`, data).pipe(catchError(err => throwError(() => err)));
  }

  getHistory(): Observable<NotificationHistory> {
    return this.http.get<NotificationHistory>(`${this.API}/history`).pipe(catchError(err => throwError(() => err)));
  }
}
