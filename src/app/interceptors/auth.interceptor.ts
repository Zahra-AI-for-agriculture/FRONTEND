import { Injectable } from '@angular/core';
import {
  HttpInterceptor,
  HttpRequest,
  HttpHandler,
  HttpEvent,
  HttpErrorResponse
} from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { Router } from '@angular/router';
import { AUTH_CONSTANTS } from '../core/constants/auth.constants';

@Injectable()
export class AuthInterceptor implements HttpInterceptor {

  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    const publicUrls = [
      '/auth/login',
      '/auth/register',
      '/health',
      '/ai/segmentation/predict'
    ];
    const isPublic = publicUrls.some(url => req.url.includes(url));
    if (isPublic) return next.handle(req);

    const token = localStorage.getItem('zahra_token');
    if (token) {
      const cloned = req.clone({
        headers: req.headers.set('Authorization', `Bearer ${token}`)
      });
      return next.handle(cloned).pipe(
        catchError((error: HttpErrorResponse) => {
          if (error.status === 401) {
            localStorage.clear();
            window.location.href = '/login';
          }
          return throwError(() => error);
        })
      );
    }
    return next.handle(req);
  }
}
