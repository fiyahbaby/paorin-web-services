import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { AbstractControl } from '@angular/forms';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { AuthService } from '../app-common/auth-service/auth.service';
import { Login } from './login/model/login.interface';

@Injectable({
  providedIn: 'root',
})
export class PortalService {
  private backendUrl!: string;

  constructor(private http: HttpClient, private authService: AuthService) { }

  private async getBackendUrl(): Promise<string> {
    return new Promise((resolve) => {
      this.http
        .get('../../assets/APP_CONFIG.txt', { responseType: 'text' })
        .subscribe((data) => {
          const ipAddress = this.extractIpAddress(data);
          this.backendUrl = `http://${ipAddress}:5000`;
          resolve(this.backendUrl);
        });
    });
  }

  private extractIpAddress(configText: string): string {
    const lines = configText.split('\n');
    const ipAddressLine = lines.find((line) => line.startsWith('ip_address:'));
    if (ipAddressLine) {
      return ipAddressLine.split(':')[1].trim();
    }
    return '';
  }

  getAccounts(): Observable<any[]> {
    const url = `${this.backendUrl}/api/accounts`;
    return this.http.get<any[]>(url);
  }

  async setAccounts(value: AbstractControl): Promise<Login> {
    const url = `${await this.getBackendUrl()}/api/login`;
    const response = this.http.post<Login>(url, value).pipe(
      tap((response: any) => {
        if (response.type === 'success') {
          this.authService.setUserType(response.userType);
        }
      })
    );
    return response.toPromise();
  }

  async getProjects(): Promise<any[]> {
    const url = `${await this.getBackendUrl()}/api/projects`;
    const projects = await this.http.get<any[]>(url).toPromise();
    return projects?.map((project) => {
      return {
        id: project.id,
        name: project.device_name,
        revisionId: project.revision_id,
        testTypeId: project.test_type_id,
        blockId: project.block_id,
        dateCreated: project.date_created
      };
    }) || [];
  }

  async getProjectData(projectId: number): Promise<any> {
    const url = `${await this.getBackendUrl()}/api/data`;
    const projectsData = await this.http.get<any[]>(url).toPromise();
    const projectData = projectsData?.find((project) => project.id === projectId);
    return projectData || null;
  }


  async submitProjectData(projectData: any): Promise<any> {
    const url = `${await this.getBackendUrl()}/api/createProjects`;
    const response = this.http.post(url, projectData).toPromise();
    return response;
  }
}
