import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { MessageService } from 'primeng/api';
import { PortalService } from 'src/app/portal/portal.service';

@Component({
  selector: 'app-confirm-delete-project',
  templateUrl: './confirm-delete-project.component.html',
  styleUrls: ['./confirm-delete-project.component.scss']
})
export class ConfirmDeleteProjectComponent implements OnInit {
  selectedProject: any;
  voltages: any[] = [];
  temperatures: any[] = [];
  units: any[] = [];

  constructor(
    private router: Router,
    private messageService: MessageService,
    private route: ActivatedRoute,
    private portalService: PortalService
  ) { }

  async ngOnInit(): Promise<void> {
    this.route.queryParams.subscribe((project) => {
      this.selectedProject = JSON.parse(project['data']);
    });
    const projectData = await this.portalService.getProjectData(this.selectedProject.id);
    this.voltages = projectData?.voltages || [];
    this.temperatures = projectData?.temperatures || [];
    this.units = projectData?.units || [];
  }

  onBack() {
    this.router.navigate(['../'], { relativeTo: this.route });
  }

  onSubmit() {
    this.portalService.deleteProject(this.selectedProject.id)
      .then(response => {
        this.messageService.add({ severity: 'success', summary: 'Success', detail: response.message });
        this.router.navigate(['../'], { relativeTo: this.route });
      })
      .catch(error => {
        this.messageService.add({ severity: 'error', summary: 'Error', detail: 'An error occurred while deleting the project.' });
        console.error('Error deleting project:', error);
      });
  }


  getVoltageData(): any[] {
    return this.voltages || [];
  }

  getTempData(): any[] {
    return this.temperatures || [];
  }

  getUnitData(): any[] {
    return this.units || [];
  }
}
