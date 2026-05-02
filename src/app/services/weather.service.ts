import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
// Models not imported here to avoid build issues

@Injectable({ providedIn: 'root' })
export class WeatherService {

  private readonly API = 'http://20.240.59.225:8000/api/v1/weather';

  constructor(private http: HttpClient) {}

  getCurrentWeather(city: string): Observable<any> {
    return this.http.get<any>(`${this.API}/current/${city}`).pipe(
      catchError(err => throwError(() => err))
    );
  }

  getForecast(city: string): Observable<any> {
    return this.http.get<any>(`${this.API}/forecast/${city}`).pipe(
      catchError(err => throwError(() => err))
    );
  }

  getAlerts(governorate: string): Observable<any> {
    return this.http.get<any>(`${this.API}/alerts/${governorate}`).pipe(
      catchError(err => throwError(() => err))
    );
  }

  getSiroccoRisk(city: string): Observable<any> {
    return this.http.get<any>(`${this.API}/sirocco-risk/${city}`).pipe(
      catchError(err => throwError(() => err))
    );
  }

  getSeasonalSummary(city: string): Observable<any> {
    return this.http.get<any>(`${this.API}/seasonal-summary/${city}`).pipe(
      catchError(err => throwError(() => err))
    );
  }
}
