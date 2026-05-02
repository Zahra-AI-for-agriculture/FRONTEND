import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { MarketPrice, PriceHistory, SellAdvice, RevenueForecast, Buyer } from '../models';

@Injectable({ providedIn: 'root' })
export class MarketService {

  private readonly API = 'http://20.240.59.225:8000/api/v1/market';

  constructor(private http: HttpClient) {}

  getPrices(): Observable<MarketPrice[]> {
    return this.http.get<MarketPrice[]>(`${this.API}/prices`).pipe(
      catchError(err => throwError(() => err))
    );
  }

  getPriceHistory(crop: string): Observable<PriceHistory> {
    return this.http.get<PriceHistory>(`${this.API}/prices/${crop}/history`).pipe(
      catchError(err => throwError(() => err))
    );
  }

  getSellAdvice(parcelId: number): Observable<SellAdvice> {
    return this.http.get<SellAdvice>(`${this.API}/sell-advice/${parcelId}`).pipe(
      catchError(err => throwError(() => err))
    );
  }

  getRevenueForecast(parcelId: number): Observable<RevenueForecast> {
    return this.http.get<RevenueForecast>(`${this.API}/revenue-forecast/${parcelId}`).pipe(
      catchError(err => throwError(() => err))
    );
  }

  getBuyers(): Observable<Buyer[]> {
    return this.http.get<Buyer[]>(`${this.API}/buyers`).pipe(
      catchError(err => throwError(() => err))
    );
  }
}
