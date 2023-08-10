import { Component, OnInit, AfterViewInit, OnDestroy, ViewChild, ElementRef } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { MessageService, SortEvent } from 'primeng/api';
import { PortalService } from 'src/app/portal/portal.service';
import { ChartModule } from 'primeng/chart';
import { Chart } from 'chart.js/auto';

@Component({
  selector: 'app-view-m-data-page',
  templateUrl: './view-m-data-page.component.html',
  styleUrls: ['./view-m-data-page.component.scss']
})
export class ViewMDataPageComponent implements OnInit {
  buildIDsArray: any;
  individualBuildData: { [key: string]: any } = {};
  combinedData: any[] = [];
  buildData: any;
  reccomendedData: any;
  reccomendedDataMap: { [key: string]: any } = {};
  recommendedUnit: { [key: string]: any } = {};
  recommendedProjectList: { [key: string]: any } = {};
  recommendedVoltage: { [key: string]: any } = {};
  recommendedTemp: { [key: string]: any } = {};
  isExistMap: { [buildID: string]: boolean } = {};
  selectedProject: { [key: string]: any } = {};
  selectedProjects: { [key: string]: any } = {};
  manualSelectProject: any;
  selectedVoltage: { [key: string]: any } = {};
  selectedUnit: { [key: string]: any } = {};
  selectedTemp: { [key: string]: any } = {};
  isExist = false;
  missingVar = '';
  projects: any[] = [];
  projectVoltages: any[] = [];
  projectUnits: any[] = [];
  projectTemps: any[] = [];



  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private portalService: PortalService,
    private messageService: MessageService,
  ) { }

  ngOnInit() {
    this.route.queryParams.subscribe((params) => {
      const buildIDsArray = params['buildIDs'];
      this.buildIDsArray = buildIDsArray.split(',');
      this.combineData();
    });
  }

  async combineData(): Promise<void> {
    try {
      for (const buildID of this.buildIDsArray) {
        const buildData = await this.portalService.getBuildData(JSON.stringify({ "buildID": buildID }));
        this.individualBuildData[buildID] = buildData;
        await this.getRecommendedData(buildData, buildID);
        this.combinedData.push(...buildData);
      }
    } catch (error) {
      console.error('An error occurred while combining data:', error);
      this.messageService.add({
        severity: 'error',
        summary: 'Error',
        detail: 'An error occurred while combining data',
        life: 3000
      });
    }
  }

  getRecommendedData(buildData: any, buildID: string): void {
    this.portalService.getRecomendedData(buildData)
      .then(response => {
        this.reccomendedDataMap[buildID] = response;
        this.recommendedProjectList[buildID] = response["recomended_projects"];
        this.recommendedUnit[buildID] = response["unit"];
        this.recommendedVoltage[buildID] = response["voltage"];
        this.recommendedTemp[buildID] = response["similar_temp"];

        if (this.recommendedProjectList[buildID] && this.recommendedProjectList[buildID].length === 1 && this.recommendedVoltage[buildID].length === 1 && this.recommendedTemp[buildID].length === 1) {
          console.log(buildID);
          this.isExist = true;
          this.isExistMap[buildID] = true;
          this.selectedProject[buildID] = this.recommendedProjectList[buildID][0];
          this.selectedVoltage[buildID] = this.recommendedVoltage[buildID][0];
          this.selectedUnit[buildID] = this.recommendedUnit[buildID][0];
          this.selectedTemp[buildID] = this.recommendedTemp[buildID][0];
        }
        else {
          console.log(buildID);
          let missingVariables = "";
          if (this.recommendedProjectList[buildID]) {
            missingVariables += "Project ";
          }
          if (this.recommendedUnit[buildID].length) {
            missingVariables += "Unit ";
          }
          if (this.recommendedVoltage[buildID].length) {
            missingVariables += "Voltage ";
          }
          if (this.recommendedTemp[buildID].length) {
            missingVariables += "Temperature ";
          }
          this.missingVar = missingVariables;
          this.isExist = false;
          this.isExistMap[buildID] = false;
          this.fetchProjects();
        }
      })
  }

  private async fetchProjects() {
    try {
      this.projects = await this.portalService.getProjects();
    } catch (error) {
      console.log("Error retrieving project details.")
    }
  }

  async onProjectSelect(event: any, buildID: string) {
    this.selectedProjects[buildID] = event.data;
  }

  async onProjectSelect2(event: any) {
    this.manualSelectProject = event.data;

    try {
      const projectId = this.manualSelectProject.id;
      const data = await this.portalService.getVoltagesAndTemperatures(projectId);

      if (data) {
        this.projectVoltages = data.voltages;
        this.projectTemps = data.temperatures;
        this.projectUnits = data.units;
      }
    } catch (error) {
      console.error('Error retrieving voltages and temperatures:', error);
    }
  }

  onBack(): void {
    this.router.navigate(['../'], { relativeTo: this.route });
  }

  onSubmit() {
    console.log(this.selectedProject);
  }
}
