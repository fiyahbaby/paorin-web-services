import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { PortalService } from 'src/app/portal/portal.service';

@Component({
  selector: 'app-project-page',
  templateUrl: './project-page.component.html',
  styleUrls: ['./project-page.component.scss']
})
export class ProjectPageComponent implements OnInit {
  selectedProject: any;
  voltages: any[] = [];
  temperatures: any[] = [];
  units: any[] = [];

  constructor(private route: ActivatedRoute, private portalService: PortalService) { }

  async ngOnInit(): Promise<void> {
    this.route.queryParams.subscribe(params => {
      this.selectedProject = JSON.parse(params['data']);
    });
    console.log(this.selectedProject);

    const projectData = await this.portalService.getProjectData(this.selectedProject.id);
    console.log(projectData);

    this.voltages = projectData?.voltages || [];
    this.temperatures = projectData?.temperatures || [];
    this.units = projectData?.units || [];
    console.log(this.voltages);
    console.log(this.temperatures);
    console.log(this.units);
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
