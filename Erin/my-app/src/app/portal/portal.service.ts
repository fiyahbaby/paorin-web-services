import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { AbstractControl } from '@angular/forms';
import { Login } from './login/model/login.interface';
import { AuthService } from '../app-common/auth-service/auth.service';
import { tap } from 'rxjs/operators';

@Injectable({
  providedIn: 'root',
})
export class PortalService {
  private backendUrl!: string;

  constructor(private http: HttpClient, private authService: AuthService) {
    this.getBackendUrl();
  }

  private getBackendUrl(): void {
    this.http
      .get<{ ip: string }>('http://172.22.119.78:5000/api/ip')
      .subscribe((data) => {
        this.backendUrl = `http://${data.ip}:5000`;
      });
  }

  getAccounts(): Observable<any[]> {
    const url = `${this.backendUrl}/api/accounts`;
    return this.http.get<any[]>(url);
  }

  setAccounts(value: AbstractControl): Observable<Login> {
    const url = `${this.backendUrl}/api/login`;
    return this.http.post<Login>(url, value).pipe(
      tap((response: any) => {
        if (response.type === 'success') {
          this.authService.setUserType(response.userType);
        }
      })
    );
  }
}
