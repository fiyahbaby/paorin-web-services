import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { PortalService } from 'src/app/portal/portal.service';

@Component({
  selector: 'app-project-page',
  templateUrl: './project-page.component.html',
  styleUrls: ['./project-page.component.scss']
})
export class ProjectPageComponent implements OnInit {
  selectedProject: any;
  projectID: any;
  voltages: any[] = [];
  temperatures: any[] = [];
  units: any[] = [];
  processedTests: any[] | undefined;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private portalService: PortalService) { }

  async ngOnInit(): Promise<void> {
    this.route.queryParams.subscribe(params => {
      this.selectedProject = JSON.parse(params['data']);
    });
    this.projectID = this.selectedProject.id;

    const projectData = await this.portalService.getProjectData(this.projectID);
    this.voltages = projectData?.voltages || [];
    this.temperatures = projectData?.temperatures || [];
    this.units = projectData?.units || [];

    this.getProcessedTests();
  }

  async getProcessedTests(): Promise<void> {
    try {
      this.processedTests = await this.portalService.getProcessedTests(this.projectID);
    } catch (error) {
      console.error('Error fetching processed tests:', error);
    }
    console.log(this.processedTests);
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

  onBack() {
    this.router.navigate(['../'], { relativeTo: this.route });
  }
}
