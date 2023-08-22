import { Component, OnInit } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthService } from 'src/app/app-common/auth-service/auth.service';
import { FormCommonService } from 'src/app/app-common/form-common/form-common.service';
import { PortalService } from '../../portal.service';
import { MessageService } from 'primeng/api';

@Component({
  selector: 'app-view-project',
  templateUrl: './view-project.component.html',
  styleUrls: ['./view-project.component.scss']
})
export class ViewProjectComponent implements OnInit {
  projects: any[] = [];
  selectedProject: any;

  constructor(
    private formBuilder: FormBuilder,
    private portalService: PortalService,
    private router: Router,
    private route: ActivatedRoute,
    private authService: AuthService,
    private formCommonService: FormCommonService,
    private messageService: MessageService
  ) { }

  ngOnInit(): void {
    this.fetchProjects();
  }

  private async fetchProjects() {
    try {
      this.projects = await this.portalService.getProjects();
    } catch (error) {
      console.log("Error retrieving project details.")
    }
  }

  onBack() {
    this.router.navigate(['/home']);
  }

  onSubmit() {
    const selectedProject = JSON.stringify(this.selectedProject);
    if (!this.selectedProject) {
      this.messageService.add({
        severity: 'error',
        summary: 'Error',
        detail: 'Please select a project.',
        life: 3000
      });
    } else {
      this.router.navigate(['project-page'], {
        relativeTo: this.route,
        queryParams:
        {
          data: selectedProject,
        }
      });
    }
  }
}
