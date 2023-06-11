import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import { AuthService } from './auth.service';

@Injectable({
  providedIn: 'root',
})
export class AuthGuard implements CanActivate {
  constructor(private router: Router, private authService: AuthService) { }

  canActivate(): boolean {
    if (this.authService.isLoggedIn()) {
      // User is logged in, allow access
      return true;
    } else {
      // User is not logged in, redirect to the login page
      this.router.navigate(['/']);
      return false;
    }
  }
}
