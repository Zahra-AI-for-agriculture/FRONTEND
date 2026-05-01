import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { WeatherCurrent, WeatherForecast, WeatherAlert, SiroccoRisk, SeasonalSummary } from '../models';

@Injectable({ providedIn: 'root' })
export class WeatherService {

  private readonly API = 'http://localhost:8000/api/v1/weather';

  constructor(private http: HttpClient) {}

  getCurrentWeather(city: string): Observable<WeatherCurrent> {
    return this.http.get<WeatherCurrent>(`${this.API}/current/${city}`).pipe(
      catchError(err => throwError(() => err))
    );
  }

  getForecast(city: string): Observable<WeatherForecast> {
    return this.http.get<WeatherForecast>(`${this.API}/forecast/${city}`).pipe(
      catchError(err => throwError(() => err))
    );
  }

  getAlerts(governorate: string): Observable<WeatherAlert[]> {
    return this.http.get<WeatherAlert[]>(`${this.API}/alerts/${governorate}`).pipe(
      catchError(err => throwError(() => err))
    );
  }

  getSiroccoRisk(city: string): Observable<SiroccoRisk> {
    return this.http.get<SiroccoRisk>(`${this.API}/sirocco-risk/${city}`).pipe(
      catchError(err => throwError(() => err))
    );
  }

  getSeasonalSummary(city: string): Observable<SeasonalSummary> {
    return this.http.get<SeasonalSummary>(`${this.API}/seasonal-summary/${city}`).pipe(
      catchError(err => throwError(() => err))
    );
  }
}
