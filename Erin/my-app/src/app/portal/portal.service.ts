import { HttpClient, HttpHeaders } from '@angular/common/http';
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
    const url = `${await this.getBackendUrl()}/api/data?projectId=${projectId}`;
    const projectData = await this.http.get<any>(url).toPromise();
    return projectData;
  }



  async submitProjectData(projectData: any): Promise<any> {
    const url = `${await this.getBackendUrl()}/api/createProjects`;
    const response = this.http.post(url, projectData).toPromise();
    return response;
  }

  async addProjectParam(projectParam: any): Promise<any> {
    const url = `${await this.getBackendUrl()}/api/addProjectParam`;
    const response = this.http.post(url, projectParam).toPromise();
    return response;
  }

  async updateProjectData(modifiedData: any): Promise<any> {
    const url = `${await this.getBackendUrl()}/api/updateProjectData`;
    const response = this.http.put(url, modifiedData).toPromise();
    return response;
  }

  async deleteProject(projectId: number): Promise<any> {
    const url = `${await this.getBackendUrl()}/api/deleteProject/${projectId}`;
    return this.http.delete(url).toPromise()
      .then(response => {
        return response;
      })
      .catch(error => {
        throw error;
      });
  }

  async getBuildData(buildID: string): Promise<any> {
    const parsedBuildID = JSON.parse(buildID)['buildID'];
    const url = `${await this.getBackendUrl()}/api/retrieveDbData/${parsedBuildID}`;
    const data = await this.http.get<any>(url).toPromise();
    return data;
  }

  async sendBuildData(buildData: any): Promise<any> {
    const url = `${await this.getBackendUrl()}/api/processTempLimit`;
    return this.http.post(url, buildData).toPromise();
  }

  async addTestList(fileContent: string): Promise<any> {
    const url = `${await this.getBackendUrl()}/api/addTestList`;
    const response = this.http.post(url, fileContent).toPromise();
    return response;
  }

  async getProcessedTests(projectId: number): Promise<any[] | undefined> {
    const url = `${await this.getBackendUrl()}/api/processed_tests?project_id=${projectId}`;
    const response = this.http.get<any[]>(url).toPromise();
    return response;
  }
}
