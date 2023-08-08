import { Component, OnInit, AfterViewInit, OnDestroy, ViewChild, ElementRef } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { MessageService, SortEvent } from 'primeng/api';
import { PortalService } from 'src/app/portal/portal.service';
import { ChartModule } from 'primeng/chart';
import { Chart } from 'chart.js/auto';

@Component({
  selector: 'app-view-data-page',
  templateUrl: './view-data-page.component.html',
  styleUrls: ['./view-data-page.component.scss']
})
export class ViewDataPageComponent implements OnInit {
  @ViewChild('chartCanvas') chartCanvas!: ElementRef;
  @ViewChild('lineChartCanvas') lineChartCanvas!: ElementRef;
  projects: any[] = [];
  selectedProject: any;
  projectVoltages: any[] = [];
  selectedVoltage: any;
  projectUnits: any[] = [];
  selectedUnit: any;
  projectTemps: any[] = [];
  selectedTemp: any;
  buildID: any;
  buildData: any;
  testCount = 0;
  passingPercentage = 0;
  buildDataMap: { [key: string]: any } = {};
  testResultMap: { [key: string]: any } = {};
  refParam: any;
  highestMaxTemp!: number;
  lowestMinTemp!: number;
  private storageKey = 'viewData';
  testParam: string[] = [
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
    "Date/Time"
  ];
  testResults: any[] = [
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

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private portalService: PortalService,
    private messageService: MessageService,
  ) { }

  ngOnInit(): void {
    this.route.queryParams.subscribe((params) => {
      this.buildID = params;
      console.log("build ID: ", this.buildID);
      this.fetchData();
    });
    this.fetchProjects();
  }

  private async fetchProjects() {
    try {
      this.projects = await this.portalService.getProjects();
    } catch (error) {
      console.log("Error retrieving project details.")
    }
  }

  fetchData(): void {
    if (this.buildID && this.buildID.buildID) {
      console.log("Single build ID")
      this.portalService.getBuildData(this.buildID.buildID)
        .then((buildData) => {
          this.processBuildData([buildData]);
          console.log(buildData)
        })
        .catch((error) => {
          console.error('An error occurred while fetching build data:', error);
          this.messageService.add({
            severity: 'error',
            summary: 'Error',
            detail: 'An error occurred while fetching build data',
            life: 3000
          });
          window.scrollTo(0, 0);
        });
    } else if (this.buildID && typeof this.buildID === 'object' && this.buildID.buildIDs) {
      const buildIDsArray = this.buildID.buildIDs.split(',');
      console.log("Multiple build IDs:", buildIDsArray);
      const buildDataPromises = buildIDsArray.map((id: string) => {
        return this.portalService.getBuildData(id.trim());
      });

      Promise.all(buildDataPromises)
        .then((buildDataList) => {
          console.log("Build Data List:", buildDataList);
          this.processBuildData(buildDataList);
        })
        .catch((error) => {
          console.error('An error occurred while fetching build data:', error);
          this.messageService.add({
            severity: 'error',
            summary: 'Error',
            detail: 'An error occurred while fetching build data',
            life: 3000
          });
          window.scrollTo(0, 0);
        });
    }
    else {
      console.log("Didnt record build ID")
    }
  }

  processBuildData(buildDataList: any[]): void {
    const combinedBuildData = buildDataList.reduce((acc, buildData) => {
      return acc.concat(buildData);
    }, []);

    this.buildData = combinedBuildData;
    this.createBuildDataMap();
    this.createTestResultMap();
    this.sendData();
    this.refParam = this.buildData[0];
    this.testCount = this.buildData.length;
    this.generateChart();
  }

  ngOnDestroy(): void {
    localStorage.setItem(this.storageKey, JSON.stringify(this.buildData));
  }

  createBuildDataMap(): void {
    this.buildDataMap = {};
    this.testParam.forEach((param) => {
      const paramLabel = param;
      this.buildDataMap[paramLabel] = this.buildData[paramLabel];
    });
  }

  createTestResultMap(): void {
    this.testResultMap = this.buildData.map((dataItem: any) => {
      const itemMap: { [key: string]: any } = {};
      this.testResults.forEach((param) => {
        const paramLabel = param;
        itemMap[paramLabel] = dataItem[paramLabel];
      });
      return itemMap;
    });
  }

  sendData(): void {
    this.portalService.sendBuildData(this.buildData)
      .then(response => {
        let { "Max. Temp": maxTemp, "Min. Temp": minTemp } = response;
        maxTemp = parseFloat(maxTemp).toFixed(2);
        minTemp = parseFloat(minTemp).toFixed(2);
        this.refParam = { ...this.refParam, "Max. Temp": maxTemp, "Min. Temp": minTemp };
        this.highestMaxTemp = parseFloat(maxTemp);
        this.lowestMinTemp = parseFloat(minTemp);
      })
      .catch(error => {
        console.error(error);
      });
  }

  sortNumericColumn(event: any): void {
    const column = event.field;
    const order = event.order;

    this.buildData.sort((dataItem1: any, dataItem2: any) => {
      const value1 = dataItem1[column];
      const value2 = dataItem2[column];

      if (value1 < value2) {
        return order === -1 ? 1 : -1;
      } else if (value1 > value2) {
        return order === -1 ? -1 : 1;
      } else {
        return 0;
      }
    });
  }

  getColor(value: string): string {
    if (value === 'PASS') {
      return '#00be00';
    } else if (value === 'FAIL') {
      return '#FF0000';
    } else if (value === 'NOT_RUN') {
      return '#FFA500';
    } else {
      return '';
    }
  }

  generateChart(): void {
    const doughnutCanvas = this.chartCanvas.nativeElement.getContext('2d');
    const lineChartCanvas = this.lineChartCanvas.nativeElement.getContext('2d');

    const passCount = this.buildData.filter((item: any) => item['Test Result'] === 'PASS').length;
    const failCount = this.buildData.filter((item: any) => item['Test Result'] === 'FAIL').length;
    const notRunCount = this.buildData.filter((item: any) => item['Test Result'] === 'NOT-RUN').length;

    const doughnutChartData = {
      labels: ['PASS', 'FAIL', 'NOT-RUN'],
      datasets: [{
        data: [passCount, failCount, notRunCount],
        backgroundColor: ['#00be00', '#FF0000', '#FFA500']
      }],
      elements: [{
        type: 'text',
        x: 0.5,
        y: 0.5,
        text: 'Total Tests: ' + (passCount + failCount + notRunCount),
        style: {
          fontSize: 20,
          fontWeight: 'bold',
          color: '#ffffff',
          fontFamily: '"Trebuchet MS", "Lucida Sans Unicode", "Lucida Grande", "Lucida Sans", Arial, sans-serif'
        },
        onCreated: function () {
          console.log('Text element rendered');
        }
      }]
    };

    const passingPercentage = (passCount / this.testCount) * 100;
    this.passingPercentage = Math.round(passingPercentage);

    new Chart(doughnutCanvas, {
      type: 'doughnut',
      data: doughnutChartData
    });

    const lineChartLabels = this.buildData.map((dataItem: any) => dataItem['Test Name']);
    const lineChartDatasets = [
      { label: 'Max. Temp', data: this.buildData.map((dataItem: any) => dataItem['Max. Temp']), yAxisID: 'y' },
      { label: 'Min. Temp', data: this.buildData.map((dataItem: any) => dataItem['Min. Temp']), yAxisID: 'y' },
      { label: 'VCCINT', data: this.buildData.map((dataItem: any) => dataItem['VCCINT']), yAxisID: 'y1' },
      { label: 'VCC_PMC', data: this.buildData.map((dataItem: any) => dataItem['VCC_PMC']), yAxisID: 'y1' },
      { label: 'VCC_PSFP', data: this.buildData.map((dataItem: any) => dataItem['VCC_PSFP']), yAxisID: 'y1' },
      { label: 'VCC_PSLP', data: this.buildData.map((dataItem: any) => dataItem['VCC_PSLP']), yAxisID: 'y1' },
      { label: 'VCC_RAM', data: this.buildData.map((dataItem: any) => dataItem['VCC_RAM']), yAxisID: 'y1' },
      { label: 'VCC_SOC', data: this.buildData.map((dataItem: any) => dataItem['VCC_SOC']), yAxisID: 'y1' },
    ];

    new Chart(lineChartCanvas, {
      type: 'line',
      data: { labels: lineChartLabels, datasets: lineChartDatasets },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          tooltip: {
            enabled: true,
            mode: 'index',
            intersect: false
          }
        },
        scales: {
          x: {
            ticks: {
              display: false
            }
          },
          y: {
            position: 'left',
            beginAtZero: false,
            title: {
              display: true,
              text: 'Temperature (°C)',
              font: {
                size: 14
              }
            },
            ticks: {
              font: {
                size: 12
              }
            }
          },
          y1: {
            max: 0.95,
            position: 'right',
            beginAtZero: false,
            title: {
              display: true,
              text: 'Voltage',
              font: {
                size: 14
              }
            },
            ticks: {
              font: {
                size: 12
              }
            }
          }
        }
      }
    });
  }

  onBack(): void {
    this.router.navigate(['../'], { relativeTo: this.route });
  }


  async onProjectSelect(event: any) {
    this.selectedProject = event.data;

    try {
      const projectId = this.selectedProject.id;
      const data = await this.portalService.getVoltagesAndTemperatures(projectId);

      if (data) {
        this.projectVoltages = data.voltages;
        this.projectTemps = data.temperatures;
        this.projectUnits = data.units;
      } else {
        console.log('No data available for selected project.');
      }
    } catch (error) {
      console.error('Error retrieving voltages and temperatures:', error);
    }
  }

  onSubmit() {
    if (this.selectedProject && this.selectedVoltage && this.selectedTemp && this.selectedUnit) {
      const combinedList = {
        buildData: this.buildData,
        project: this.selectedProject,
        voltage: this.selectedVoltage,
        temperature: this.selectedTemp,
        unit: this.selectedUnit
      };

      this.portalService.addToProject(combinedList)
        .then(response => {
          console.log(response);
          this.messageService.add({ severity: 'success', summary: 'Success', detail: response.message, life: 3000 });
          window.scrollTo(0, 0);
        })
        .catch(error => {
          console.error(error);
          this.messageService.add({ severity: 'error', summary: 'Error', detail: error.message, life: 3000 });
          window.scrollTo(0, 0);
        });
    }
  }
}
