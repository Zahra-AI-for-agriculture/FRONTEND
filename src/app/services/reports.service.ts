import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { Dashboard, CampaignReport, FinancialReport, SustainabilityReport } from '../models';

@Injectable({ providedIn: 'root' })
export class ReportsService {

  private readonly API = 'http://localhost:8000/api/v1/reports';

  constructor(private http: HttpClient) {}

  getDashboard(): Observable<Dashboard> {
    return this.http.get<Dashboard>(this.API + '/dashboard').pipe(
      catchError(err => throwError(() => err))
    );
  }

  getCampaign(season: string): Observable<CampaignReport> {
    return this.http.get<CampaignReport>(`${this.API}/campaign/${season}`).pipe(
      catchError(err => throwError(() => err))
    );
  }

  exportCampaignPDF(season: string): Observable<Blob> {
    return this.http.post(`${this.API}/campaign/${season}/pdf`, {}, { responseType: 'blob' }).pipe(
      catchError(err => throwError(() => err))
    );
  }

  getFinancial(): Observable<FinancialReport> {
    return this.http.get<FinancialReport>(`${this.API}/financial`).pipe(
      catchError(err => throwError(() => err))
    );
  }

  getSustainability(): Observable<SustainabilityReport> {
    return this.http.get<SustainabilityReport>(`${this.API}/sustainability`).pipe(
      catchError(err => throwError(() => err))
    );
  }
}
