import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { BehaviorSubject, Observable, throwError } from 'rxjs';
import { tap, catchError } from 'rxjs/operators';
import { Router } from '@angular/router';
import { User, LoginRequest, LoginResponse, RegisterRequest } from '../models';
import { AUTH_CONSTANTS } from '../core/constants/auth.constants';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  private readonly API = 'http://20.240.59.225:8000/api/v1/auth';
  private currentUser = new BehaviorSubject<User | null>(null);
  currentUser$ = this.currentUser.asObservable();

  constructor(private http: HttpClient, private router: Router) {
    // Restore user from localStorage on init
    const name = localStorage.getItem(AUTH_CONSTANTS.FARMER_NAME_KEY);
    const farmerId = localStorage.getItem(AUTH_CONSTANTS.FARMER_ID_KEY);
    if (name && farmerId) {
      this.currentUser.next({
        id: Number(farmerId),
        name,
        phone: '',
        governorate: localStorage.getItem(AUTH_CONSTANTS.GOVERNORATE_KEY) || undefined
      });
    }
  }

  private apiUrl = 'http://20.240.59.225:8000/api/v1';

  login(phone: string, password: string): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/auth/login`,
      { phone, password }
    ).pipe(
      tap(response => {
        localStorage.setItem('zahra_token',       response.access_token);
        localStorage.setItem('zahra_farmer_id',   String(response.farmer_id));
        localStorage.setItem('zahra_farmer_name', response.name);
        this.currentUser.next({
          id: response.farmer_id,
          name: response.name,
          phone
        });
      }),
      catchError(err => {
        console.error('Login error:', err);
        return throwError(() => err);
      })
    );
  }

  register(data: any): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/auth/register`, data).pipe(
      tap(response => {
        localStorage.setItem('zahra_token',       response.access_token);
        localStorage.setItem('zahra_farmer_id',   String(response.farmer_id));
        localStorage.setItem('zahra_farmer_name', response.name);
        this.currentUser.next(response);
      }),
      catchError(err => {
        console.error('Register error:', err);
        return throwError(() => err);
      })
    );
  }

  logout(): Observable<unknown> {
    return this.http.post(`${this.API}/logout`, {}).pipe(
      tap(() => {
        this.clearSession();
      }),
      catchError(() => {
        // Even if API fails, clear local session
        this.clearSession();
        return throwError(() => new Error('Logout failed'));
      })
    );
  }

  getMe(): Observable<User> {
    return this.http.get<User>(`${this.API}/me`).pipe(
      tap(user => this.currentUser.next(user)),
      catchError(err => {
        console.error('GetMe error:', err);
        return throwError(() => err);
      })
    );
  }

  updateMe(data: Partial<User>): Observable<User> {
    return this.http.put<User>(`${this.API}/me`, data).pipe(
      tap(user => this.currentUser.next(user)),
      catchError(err => {
        console.error('UpdateMe error:', err);
        return throwError(() => err);
      })
    );
  }

  isAuthenticated(): boolean {
    return !!localStorage.getItem(AUTH_CONSTANTS.TOKEN_KEY);
  }

  getStoredName(): string {
    return localStorage.getItem(AUTH_CONSTANTS.FARMER_NAME_KEY) || '';
  }

  getStoredGovernorate(): string {
    return localStorage.getItem(AUTH_CONSTANTS.GOVERNORATE_KEY) || 'Tunis';
  }

  getToken(): string | null {
    return localStorage.getItem(AUTH_CONSTANTS.TOKEN_KEY);
  }

  getFarmerId(): number | null {
    const id = localStorage.getItem(AUTH_CONSTANTS.FARMER_ID_KEY);
    return id ? +id : null;
  }

  private clearSession(): void {
    localStorage.removeItem(AUTH_CONSTANTS.TOKEN_KEY);
    localStorage.removeItem(AUTH_CONSTANTS.FARMER_ID_KEY);
    localStorage.removeItem(AUTH_CONSTANTS.FARMER_NAME_KEY);
    localStorage.removeItem(AUTH_CONSTANTS.GOVERNORATE_KEY);
    this.currentUser.next(null);
    this.router.navigate(['/login']);
  }
}
