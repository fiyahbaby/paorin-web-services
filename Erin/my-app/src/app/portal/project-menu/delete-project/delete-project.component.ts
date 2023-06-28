import { Component, OnInit } from '@angular/core';
import { PortalService } from '../../portal.service';
import { MessageService } from 'primeng/api';
import { ActivatedRoute, Router } from '@angular/router';

@Component({
  selector: 'app-delete-project',
  templateUrl: './delete-project.component.html',
  styleUrls: ['./delete-project.component.scss']
})
export class DeleteProjectComponent implements OnInit {
  projects: any[] = [];
  selectedProject: any;

  constructor(
    private portalService: PortalService,
    private messageService: MessageService,
    private router: Router,
    private route: ActivatedRoute,
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

  onSubmit() {
    const selectedProject = JSON.stringify(this.selectedProject);
    if (!this.selectedProject) {
      this.messageService.add({
        severity: 'error',
        summary: 'Error',
        detail: 'Please select a project.',
        life: 3000
      });
      window.scrollTo(0, 0);
    } else {
      console.log(selectedProject)
      this.router.navigate(['confirm-delete-project'], {
        relativeTo: this.route,
        queryParams: { data: selectedProject },
      })
    }
  }

  onBack() {
    this.router.navigate(['/home']);
  }
}
