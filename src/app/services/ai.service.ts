import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';


@Injectable({ providedIn: 'root' })
export class AIService {

  private readonly API = 'http://20.240.59.225:8000/api/v1/ai';

  constructor(private http: HttpClient) {}

  predictDisease(image_base64: string, crop?: string): Observable<any> {
    return this.http.post<any>(`${this.API}/disease/predict`, { image_base64, crop }).pipe(
      catchError(err => throwError(() => err))
    );
  }

  predictYield(data: any): Observable<any> {
    return this.http.post<any>(`${this.API}/yield/predict`, data).pipe(
      catchError(err => throwError(() => err))
    );
  }

  predictDrought(data: any): Observable<any> {
    return this.http.post<any>(`${this.API}/drought/predict`, data).pipe(
      catchError(err => throwError(() => err))
    );
  }

  getCurrentDrought(city: string): Observable<any> {
    return this.http.get<any>(`${this.API}/drought/current/${city}`).pipe(
      catchError(err => throwError(() => err))
    );
  }

  segmentParcel(imageBase64: string, clickX: number, clickY: number): Observable<any> {
    return this.http.post<any>(`${this.API}/segmentation/predict`, {
      image_base64: imageBase64,
      click_x:      clickX,
      click_y:      clickY,
    }).pipe(
      catchError(err => throwError(() => err))
    );
  }

  predictIrrigation(data: any): Observable<any> {
    return this.http.post<any>(`${this.API}/irrigation/predict`, data).pipe(
      catchError(err => throwError(() => err))
    );
  }

  getWeeklyIrrigationPlan(parcelId: number): Observable<any> {
    return this.http.get<any>(`${this.API}/irrigation/weekly-plan/${parcelId}`).pipe(
      catchError(err => throwError(() => err))
    );
  }

  detectNDVIAnomaly(data: any): Observable<any> {
    return this.http.post<any>(`${this.API}/ndvi/anomaly`, data).pipe(
      catchError(err => throwError(() => err))
    );
  }

  getNDVIAnomaly(parcelId: number): Observable<any> {
    return this.http.get<any>(`${this.API}/ndvi/anomaly/${parcelId}`).pipe(
      catchError(err => throwError(() => err))
    );
  }

  predictPestRisk(data: any): Observable<any> {
    return this.http.post<any>(`${this.API}/pest/predict`, data).pipe(
      catchError(err => throwError(() => err))
    );
  }

  getPestRisk(parcelId: number): Observable<any> {
    return this.http.get<any>(`${this.API}/pest/risk/${parcelId}`).pipe(
      catchError(err => throwError(() => err))
    );
  }

  fullDiagnosis(data: any): Observable<any> {
    return this.http.post<any>(`${this.API}/pipeline/full-diagnosis`, data).pipe(
      catchError(err => throwError(() => err))
    );
  }

  getAIStatus(): Observable<any> {
    return this.http.get<any>(`${this.API}/status`).pipe(
      catchError(err => throwError(() => err))
    );
  }
}
