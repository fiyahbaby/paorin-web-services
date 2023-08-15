import { Component, OnInit, AfterViewInit, OnDestroy, ViewChild, ElementRef, ChangeDetectorRef } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { MessageService, SortEvent } from 'primeng/api';
import { PortalService } from 'src/app/portal/portal.service';
import { ChartModule } from 'primeng/chart';
import { Chart } from 'chart.js/auto';
import { each } from 'chart.js/dist/helpers/helpers.core';

@Component({
  selector: 'app-view-m-data-page',
  templateUrl: './view-m-data-page.component.html',
  styleUrls: ['./view-m-data-page.component.scss']
})
export class ViewMDataPageComponent implements OnInit {
  buildIDsArray: any;
  individualBuildData: { [key: string]: any } = {};
  singleBuildCheck = false;
  summaryCheck = false;
  combinedDataCheck = false;
  combinedData: any[] = [];
  reccomendedDataMap: { [key: string]: any } = {};
  recommendedUnit: { [key: string]: any } = {};
  recommendedProject: { [key: string]: any } = {};
  recommendedVoltage: { [key: string]: any } = {};
  recommendedTemp: { [key: string]: any } = {};
  isExistMap: { [buildID: string]: boolean } = {};
  isExist = false;
  missingVar = '';
  combinedTestCount = 0;
  combinedPassCount = 0;
  combinedFailCount = 0;
  combinedNotRunCount = 0;
  passingPercentage = 0;
  combinedSummaryData: { label: string, value: number, value2: number }[] = [];
  combinedSelectedData: { label: string, value: number }[] = [];
  combinedTestResultMap: { [key: string]: any } = {};
  testResults: any[] = [
    "Build ID",
    "S-Suite",
    "Suite",
    "Test Name",
    "Test Result",
    "Max. Temp",
    "Min. Temp",
    "Run Time",
    "VCCINT",
    "VCC_PMC",
    "VCC_PSFP",
    "VCC_PSLP",
    "VCC_RAM",
    "VCC_SOC",
    "VCC_BATT",
    "VCCAUX",
    "VCCAUX_PMC",
    "VCCAUX_SYSMON",
  ];
  recommededBuildIDData: any[] = [];
  recommededBuildIDList: any[] = [];
  notRecommededBuildIDList: any[] = [];

  // per build ID
  selectProjectList: any[] = [];
  selectedProject: any;
  selectedVoltage: any[] = [];
  selectedTemp: any[] = [];
  selectedUnit: any[] = [];
  singleBuildDataMap: { [buildID: string]: { [index: string]: any } } = {};
  singleTestParamMap: { [buildID: string]: { [index: string]: any } } = {};
  singleBuildDataMapCheck = false;
  singleTestParamMapCheck = false;
  singleBuildTestParam: string[] = [
    "Build ID",
    "DNA",
    "Run Type",
    "Board",
    "Log Dir.",
    "Run Home",
    "Skew",
    "Voltage",
    "Max. Temp",
    "Min. Temp",
    "Test Duration"
  ];

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private portalService: PortalService,
    private messageService: MessageService,
    private cdr: ChangeDetectorRef
  ) { }

  ngOnInit() {
    this.route.queryParams.subscribe((params) => {
      const buildIDsArray = params['buildIDs'];
      this.buildIDsArray = buildIDsArray.split(',');
      this.processData();
    });
  }

  /*process combined data from all build IDs  
  data sent to child component: combinedData, combinedDataSummary, recommendedProject*/
  async processData(): Promise<void> {
    try {
      for (const buildID of this.buildIDsArray) {
        const buildData = await this.portalService.getBuildData(JSON.stringify({ "buildID": buildID }));
        await this.getRecommendedProject(buildData, buildID);
        this.individualBuildData[buildID] = buildData;
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
    this.combinedDataCheck = true;
    this.processCombinedData();
    this.processSingleBuildData();
    this.storeRecommededBuildIDs();
    this.cdr.detectChanges();
  }

  async getRecommendedProject(buildData: any, buildID: string): Promise<void> {
    await this.portalService.getRecomendedData(buildData)
      .then(response => {
        this.reccomendedDataMap[buildID] = response;
        this.recommendedProject[buildID] = response["recommended_projects"];
        this.recommendedUnit[buildID] = response["unit"];
        this.recommendedVoltage[buildID] = response["voltage"];
        this.recommendedTemp[buildID] = response["similar_temp"];

        if (this.recommendedProject[buildID] && this.recommendedProject[buildID].length === 1 && this.recommendedVoltage[buildID].length === 1 && this.recommendedTemp[buildID].length === 1) {
          this.isExistMap[buildID] = true;
        }
        else {
          this.isExistMap[buildID] = false;
          this.fetchProjects();
        }
      })
  }

  async processCombinedData(): Promise<void> {
    // get counts, percentages
    this.combinedTestCount = this.combinedData.length;
    this.combinedPassCount = this.combinedData.filter((item: any) => item['Test Result'] === 'PASS').length;
    this.combinedFailCount = this.combinedData.filter((item: any) => item['Test Result'] === 'FAIL').length;
    this.combinedNotRunCount = this.combinedData.filter((item: any) => item['Test Result'] === 'NOT-RUN').length;
    this.combinedSummaryData = [
      { label: 'Total', value: this.combinedTestCount, value2: 100 },
      { label: 'Pass', value: this.combinedPassCount, value2: parseFloat(((this.combinedPassCount / this.combinedTestCount) * 100).toFixed(2)) },
      { label: 'Fail', value: this.combinedFailCount, value2: parseFloat(((this.combinedFailCount / this.combinedTestCount) * 100).toFixed(2)) },
      { label: 'Not-Run', value: this.combinedNotRunCount, value2: parseFloat(((this.combinedNotRunCount / this.combinedTestCount) * 100).toFixed(2)) }
    ];
    this.summaryCheck = true;

    // map test results for viewing
    this.combinedTestResultMap = this.combinedData.map((dataItem: any) => {
      const itemMap: { [key: string]: any } = {};
      this.testResults.forEach((param) => {
        const paramLabel = param;
        itemMap[paramLabel] = dataItem[paramLabel];
      });
      return itemMap;
    });
  }

  /*if there is no recommended project, fetch projects 
  retrieve voltages, units, temps according to project selected == combinedSelectedData */
  async fetchProjects() {
    try {
      this.selectProjectList = await this.portalService.getProjects();
    } catch (error) {
      console.log("Error retrieving project details.")
    }
  }

  async onProjectSelect(event: any) {
    this.selectProjectList = event.data;
    try {
      const projectId = this.selectedProject.id;
      const data = await this.portalService.getVoltagesAndTemperatures(projectId);
      if (data) {
        this.selectedVoltage = data.voltages;
        this.selectedTemp = data.temperatures;
        this.selectedUnit = data.units;
        this.combinedSelectedData = [
          { label: "projectID", value: projectId },
          { label: "voltage", value: this.selectedVoltage },
          { label: "unit", value: this.selectedUnit },
          { label: "temperature", value: this.selectedTemp },
        ];
      }
    } catch (error) {
      console.log("Error retrieving project details.")
    }
  }

  /*process data per build ID */
  processSingleBuildData(): void {
    for (const buildID of this.buildIDsArray) {
      const buildData = this.individualBuildData[buildID];
      this.createSingleBuildDataMap(buildData, buildID);
      this.createTestParamMap(buildData, buildID);
    }
    this.singleBuildCheck = true;
  }

  // retrieve build data for each build ID and store into singleBuildDataMap
  createSingleBuildDataMap(buildData: any[], buildID: string): void {
    this.singleBuildDataMap[buildID] = {};
    buildData.forEach((data, index) => {
      const formattedData: { [key: string]: any } = {};
      this.testResults.forEach((param) => {
        if (param in data) {
          if (data[param] === null || data[param] === "null") {
            formattedData[param] = "NULL";
          } else {
            formattedData[param] = data[param];
          }
        } else {
          formattedData[param] = "NULL";
        }
      });
      this.singleBuildDataMap[buildID][index] = formattedData;
    });
    this.singleBuildDataMapCheck = true;
  }

  // retrieve test param for each build ID and store into singleTestParamMap
  createTestParamMap(buildData: any[], buildID: string): void {
    this.singleTestParamMap[buildID] = {};
    const firstElement = buildData[0];
    this.singleBuildTestParam.forEach((param) => {
      if (param in firstElement) {
        this.singleTestParamMap[buildID][param] = firstElement[param];
      } else {
        this.singleTestParamMap[buildID][param] = "NULL";
      }
    });
    this.singleTestParamMapCheck = true;
  }

  onBack(): void {
    this.router.navigate(['../'], { relativeTo: this.route });
  }

  async storeRecommededBuildIDs(): Promise<void> {
    console.log(this.reccomendedDataMap);
    for (const buildID of this.buildIDsArray) {
      if (this.reccomendedDataMap[buildID] && this.reccomendedDataMap[buildID].isRecommendExist === true) {
        this.recommededBuildIDData.push({
          buildID: buildID,
          buildData: [this.singleBuildDataMap[buildID][0]],
          project: this.recommendedProject[buildID][0],
          voltage: this.recommendedVoltage[buildID][0],
          temperature: this.recommendedTemp[buildID][0],
          unit: this.recommendedUnit[buildID][0]
        });
        this.recommededBuildIDList.push(buildID);
      }
      else {
        this.notRecommededBuildIDList.push(buildID);
      }
    }
    console.log("this.recommededBuildIDData", this.recommededBuildIDData);
    console.log("this.recommededBuildIDList", this.recommededBuildIDList);
  }

  onSubmit(): void {
    const promises: Promise<any>[] = [];
    for (const buildID of this.recommededBuildIDList) {
      const combinedList = {
        buildData: [this.singleBuildDataMap[buildID][0]],
        project: this.recommendedProject[buildID][0],
        voltage: this.recommendedVoltage[buildID][0],
        temperature: this.recommendedTemp[buildID][0],
        unit: this.recommendedUnit[buildID][0]
      };
      const addToProjectPromise = this.portalService.addToProject(combinedList);
      promises.push(addToProjectPromise);
    }

    Promise.all(promises)
      .then(responses => {
        console.log(responses);
        this.messageService.add({
          severity: 'success',
          summary: 'Success',
          detail: 'All items have been added successfully.',
          life: 3000
        });
        window.scrollTo(0, 0);
      })
      .catch(errors => {
        console.error(errors);
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'An error occurred while adding items.',
          life: 3000
        });
        window.scrollTo(0, 0);
      });
  }
}
