import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private readonly USER_TYPE_KEY = 'userType';
  loggedInUserType: string | undefined;

  constructor() {
    const storedUserType = localStorage.getItem(this.USER_TYPE_KEY);
    this.loggedInUserType = storedUserType ? storedUserType : undefined;
  }

  setUserType(userType: string): void {
    this.loggedInUserType = userType;
    localStorage.setItem(this.USER_TYPE_KEY, userType);
  }

  getUserType(): string | undefined {
    return this.loggedInUserType;
  }

  isLoggedIn(): boolean {
    return !!this.loggedInUserType;
  }

  isAdmin(): boolean {
    return this.loggedInUserType === 'admin';
  }

  logout(): void {
    this.loggedInUserType = undefined;
    localStorage.removeItem(this.USER_TYPE_KEY);
  }
}
