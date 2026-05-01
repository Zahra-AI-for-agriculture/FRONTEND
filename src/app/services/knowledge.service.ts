import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { Crop, CropCalendar, SoilType, Subsidy, Seed } from '../models';

@Injectable({ providedIn: 'root' })
export class KnowledgeService {

  private readonly API = 'http://localhost:8000/api/v1/knowledge';

  constructor(private http: HttpClient) {}

  getCrops(): Observable<Crop[]> {
    return this.http.get<Crop[]>(`${this.API}/crops`).pipe(
      catchError(err => throwError(() => err))
    );
  }

  getCrop(id: number): Observable<Crop> {
    return this.http.get<Crop>(`${this.API}/crops/${id}`).pipe(
      catchError(err => throwError(() => err))
    );
  }

  getCalendar(crop: string, region: string): Observable<CropCalendar> {
    return this.http.get<CropCalendar>(`${this.API}/calendar/${crop}/${region}`).pipe(
      catchError(err => throwError(() => err))
    );
  }

  getSoilTypes(region: string): Observable<SoilType[]> {
    return this.http.get<SoilType[]>(`${this.API}/soil-types/${region}`).pipe(
      catchError(err => throwError(() => err))
    );
  }

  getSubsidies(): Observable<Subsidy[]> {
    return this.http.get<Subsidy[]>(`${this.API}/subsidies`).pipe(
      catchError(err => throwError(() => err))
    );
  }

  getSeeds(): Observable<Seed[]> {
    return this.http.get<Seed[]>(`${this.API}/seeds`).pipe(
      catchError(err => throwError(() => err))
    );
  }
}
