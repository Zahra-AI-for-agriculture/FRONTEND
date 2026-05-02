import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { Pesticide, TreatmentLogEntry, TreatmentLog, DARReminder, Prescription } from '../models';

@Injectable({ providedIn: 'root' })
export class TreatmentsService {

  private readonly API = 'http://localhost:8000/api/v1/treatments';

  constructor(private http: HttpClient) {}

  getPesticides(): Observable<Pesticide[]> {
    return this.http.get<Pesticide[]>(`${this.API}/pesticides`).pipe(
      catchError(err => throwError(() => err))
    );
  }

  getPesticidesByDisease(disease: string): Observable<Pesticide[]> {
    return this.http.get<Pesticide[]>(`${this.API}/pesticides/${disease}`).pipe(
      catchError(err => throwError(() => err))
    );
  }

  logTreatment(data: TreatmentLogEntry): Observable<TreatmentLogEntry> {
    return this.http.post<TreatmentLogEntry>(`${this.API}/log`, data).pipe(
      catchError(err => throwError(() => err))
    );
  }

  getTreatmentLog(parcelId: number): Observable<TreatmentLog> {
    return this.http.get<TreatmentLog>(`${this.API}/log/${parcelId}`).pipe(
      catchError(err => throwError(() => err))
    );
  }

  getDARReminders(): Observable<DARReminder[]> {
    return this.http.get<DARReminder[]>(`${this.API}/dar-reminders`).pipe(
      catchError(err => throwError(() => err))
    );
  }

  getPrescription(disease: string): Observable<Prescription> {
    return this.http.get<Prescription>(`${this.API}/prescription/${disease}`).pipe(
      catchError(err => throwError(() => err))
    );
  }
}
