import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import {
  DiseaseResult,
  YieldPredictRequest, YieldResult,
  DroughtPredictRequest, DroughtResult,
  SegmentationRequest, SegmentationResult,
  IrrigationPredictRequest, IrrigationResult, WeeklyPlan,
  NDVIAnomalyRequest, NDVIAnomalyResult,
  PestPredictRequest, PestResult,
  FullDiagnosisRequest, FullDiagnosisResult,
  AIStatus
} from '../models';

@Injectable({ providedIn: 'root' })
export class AIService {

  private readonly API = 'http://localhost:8000/api/v1/ai';

  constructor(private http: HttpClient) {}

  predictDisease(image_base64: string, crop?: string): Observable<DiseaseResult> {
    return this.http.post<DiseaseResult>(`${this.API}/disease/predict`, { image_base64, crop }).pipe(
      catchError(err => throwError(() => err))
    );
  }

  predictYield(data: YieldPredictRequest): Observable<YieldResult> {
    return this.http.post<YieldResult>(`${this.API}/yield/predict`, data).pipe(
      catchError(err => throwError(() => err))
    );
  }

  predictDrought(data: DroughtPredictRequest): Observable<DroughtResult> {
    return this.http.post<DroughtResult>(`${this.API}/drought/predict`, data).pipe(
      catchError(err => throwError(() => err))
    );
  }

  getCurrentDrought(city: string): Observable<DroughtResult> {
    return this.http.get<DroughtResult>(`${this.API}/drought/current/${city}`).pipe(
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

  predictIrrigation(data: IrrigationPredictRequest): Observable<IrrigationResult> {
    return this.http.post<IrrigationResult>(`${this.API}/irrigation/predict`, data).pipe(
      catchError(err => throwError(() => err))
    );
  }

  getWeeklyIrrigationPlan(parcelId: number): Observable<WeeklyPlan> {
    return this.http.get<WeeklyPlan>(`${this.API}/irrigation/weekly-plan/${parcelId}`).pipe(
      catchError(err => throwError(() => err))
    );
  }

  detectNDVIAnomaly(data: NDVIAnomalyRequest): Observable<NDVIAnomalyResult> {
    return this.http.post<NDVIAnomalyResult>(`${this.API}/ndvi/anomaly`, data).pipe(
      catchError(err => throwError(() => err))
    );
  }

  getNDVIAnomaly(parcelId: number): Observable<NDVIAnomalyResult> {
    return this.http.get<NDVIAnomalyResult>(`${this.API}/ndvi/anomaly/${parcelId}`).pipe(
      catchError(err => throwError(() => err))
    );
  }

  predictPestRisk(data: PestPredictRequest): Observable<PestResult> {
    return this.http.post<PestResult>(`${this.API}/pest/predict`, data).pipe(
      catchError(err => throwError(() => err))
    );
  }

  getPestRisk(parcelId: number): Observable<PestResult> {
    return this.http.get<PestResult>(`${this.API}/pest/risk/${parcelId}`).pipe(
      catchError(err => throwError(() => err))
    );
  }

  fullDiagnosis(data: FullDiagnosisRequest): Observable<FullDiagnosisResult> {
    return this.http.post<FullDiagnosisResult>(`${this.API}/pipeline/full-diagnosis`, data).pipe(
      catchError(err => throwError(() => err))
    );
  }

  getAIStatus(): Observable<AIStatus> {
    return this.http.get<AIStatus>(`${this.API}/status`).pipe(
      catchError(err => throwError(() => err))
    );
  }
}
