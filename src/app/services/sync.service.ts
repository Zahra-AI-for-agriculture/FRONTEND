import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { SyncPush, SyncPull } from '../models';

@Injectable({ providedIn: 'root' })
export class SyncService {
  private readonly API = 'http://20.240.59.225:8000/api/v1/sync';
  constructor(private http: HttpClient) {}

  pushData(data: SyncPush): Observable<unknown> {
    return this.http.post(`${this.API}/push`, data).pipe(catchError(err => throwError(() => err)));
  }

  pullData(): Observable<SyncPull> {
    return this.http.get<SyncPull>(`${this.API}/pull`).pipe(catchError(err => throwError(() => err)));
  }
}
