import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { AUTH_CONSTANTS } from '../core/constants/auth.constants';

@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanActivate {

  constructor(private auth: AuthService, private router: Router) {}

  canActivate(): boolean {
    const token = localStorage.getItem('zahra_token');
    if (token) return true;
    this.router.navigate(['/login']);
    return false;
  }
}
