import { Component, ElementRef, Input, OnInit, ViewChild, AfterViewInit, ChangeDetectorRef } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { MessageService } from 'primeng/api';
import { PortalService } from 'src/app/portal/portal.service';
import { Chart } from 'chart.js/auto';

@Component({
  selector: 'app-data-tab',
  templateUrl: './data-tab.component.html',
  styleUrls: ['./data-tab.component.scss']
})
export class DataTabComponent implements OnInit, AfterViewInit {
  @Input() buildID: string | undefined;
  @Input() combinedBuildData: any[] = [];
  @Input() combinedSummaryData: any[] = [];
  @Input() singleBuildData: any[] = [];
  @Input() refParam: any;
  @Input() singleRecommendedData: any;
  @ViewChild('chartCanvas') chartCanvas!: ElementRef;
  @ViewChild('lineChartCanvas') lineChartCanvas!: ElementRef;
  @ViewChild('singleChartCanvas') singleChartCanvas!: ElementRef;
  @ViewChild('singleLineChartCanvas') singleLineChartCanvas!: ElementRef;
  singleBuildDataArray: any[] = [];
  chartBuildData: any[] = [];
  projects: any[] = [];
  buildDataMap: { [key: string]: any } = {};
  testResultMap: { [key: string]: any } = {};
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
    "Test Duration"
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
  highestMaxTemp!: number;
  lowestMinTemp!: number;
  testCount = 0;
  passCount = 0;
  failCount = 0;
  notRunCount = 0;
  passingPercentage = 0;
  reccomendedData: any;
  recommendedUnit: any;
  recommendedProject: any;
  recommendedVoltage: any;
  recommendedTemp: any;
  missingVar = '';
  isExist = false;
  projectList: any[] = [];
  unitList: any[] = [];
  tempList: any[] = [];
  voltageList: any[] = [];
  selectedProject: any;
  selectedVoltage: any;
  selectedUnit: any;
  selectedTemp: any;
  testDuration: any;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private portalService: PortalService,
    private messageService: MessageService,
    private changeDetectorRef: ChangeDetectorRef
  ) { }

  ngOnInit(): void {
    if (this.singleBuildData.length > 0) {
      this.singleBuildDataArray = this.singleBuildData.flatMap(obj => Object.values(obj));
      this.mapTestParam();
      this.mapRecommendedData();
    }
  }

  ngAfterViewInit(): void {
    if (this.singleBuildDataArray.length > 0) {
      this.generateSingleDataChart();
    } else if (this.combinedBuildData.length > 0) {
      this.generateCombinedDataChart(this.combinedBuildData);
    }
  }

  mapTestParam(): void {
    this.highestMaxTemp = this.refParam['Max. Temp'];
    this.lowestMinTemp = this.refParam['Min. Temp'];
    this.testDuration = this.refParam['Test Duration'];
  }

  generateCombinedDataChart(chartBuildData: any[] = []): void {
    const doughnutCanvas = this.chartCanvas?.nativeElement.getContext('2d');
    const lineChartCanvas = this.lineChartCanvas?.nativeElement.getContext('2d');

    if (!doughnutCanvas || !lineChartCanvas) {
      return;
    }

    this.testCount = chartBuildData.length;
    const passCount = chartBuildData.filter((item: any) => item['Test Result'] === 'PASS').length;
    const failCount = chartBuildData.filter((item: any) => item['Test Result'] === 'FAIL').length;
    const notRunCount = chartBuildData.filter((item: any) => item['Test Result'] === 'NOT-RUN').length;

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
      type: 'pie',
      data: doughnutChartData
    });

    const lineChartLabels = chartBuildData.map((dataItem: any) => dataItem['Test Name']);
    const lineChartDatasets = [
      { label: 'Max. Temp', data: chartBuildData.map((dataItem: any) => dataItem['Max. Temp']), yAxisID: 'y' },
      { label: 'Min. Temp', data: chartBuildData.map((dataItem: any) => dataItem['Min. Temp']), yAxisID: 'y' },
      { label: 'VCCINT', data: chartBuildData.map((dataItem: any) => dataItem['VCCINT']), yAxisID: 'y1' },
      { label: 'VCC_PMC', data: chartBuildData.map((dataItem: any) => dataItem['VCC_PMC']), yAxisID: 'y1' },
      { label: 'VCC_PSFP', data: chartBuildData.map((dataItem: any) => dataItem['VCC_PSFP']), yAxisID: 'y1' },
      { label: 'VCC_PSLP', data: chartBuildData.map((dataItem: any) => dataItem['VCC_PSLP']), yAxisID: 'y1' },
      { label: 'VCC_RAM', data: chartBuildData.map((dataItem: any) => dataItem['VCC_RAM']), yAxisID: 'y1' },
      { label: 'VCC_SOC', data: chartBuildData.map((dataItem: any) => dataItem['VCC_SOC']), yAxisID: 'y1' },
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
    this.changeDetectorRef.detectChanges();
  }

  generateSingleDataChart(): void {
    const singleDataPieCanvas = this.singleChartCanvas?.nativeElement.getContext('2d');
    const singleDataLineChartCanvas = this.singleLineChartCanvas?.nativeElement.getContext('2d');

    if (!singleDataPieCanvas || !singleDataLineChartCanvas) {
      return;
    }

    this.testCount = this.singleBuildDataArray.length;
    const passCount = this.singleBuildDataArray.filter((item: any) => item['Test Result'] === 'PASS').length;
    const failCount = this.singleBuildDataArray.filter((item: any) => item['Test Result'] === 'FAIL').length;
    const notRunCount = this.singleBuildDataArray.filter((item: any) => item['Test Result'] === 'NOT-RUN').length;

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

    new Chart(singleDataPieCanvas, {
      type: 'pie',
      data: doughnutChartData
    });

    const lineChartLabels = this.singleBuildDataArray.map((dataItem: any) => dataItem['Test Name']);
    const lineChartDatasets = [
      { label: 'Max. Temp', data: this.singleBuildDataArray.map((dataItem: any) => dataItem['Max. Temp']), yAxisID: 'y' },
      { label: 'Min. Temp', data: this.singleBuildDataArray.map((dataItem: any) => dataItem['Min. Temp']), yAxisID: 'y' },
      { label: 'VCCINT', data: this.singleBuildDataArray.map((dataItem: any) => dataItem['VCCINT']), yAxisID: 'y1' },
      { label: 'VCC_PMC', data: this.singleBuildDataArray.map((dataItem: any) => dataItem['VCC_PMC']), yAxisID: 'y1' },
      { label: 'VCC_PSFP', data: this.singleBuildDataArray.map((dataItem: any) => dataItem['VCC_PSFP']), yAxisID: 'y1' },
      { label: 'VCC_PSLP', data: this.singleBuildDataArray.map((dataItem: any) => dataItem['VCC_PSLP']), yAxisID: 'y1' },
      { label: 'VCC_RAM', data: this.singleBuildDataArray.map((dataItem: any) => dataItem['VCC_RAM']), yAxisID: 'y1' },
      { label: 'VCC_SOC', data: this.singleBuildDataArray.map((dataItem: any) => dataItem['VCC_SOC']), yAxisID: 'y1' },
    ];

    new Chart(singleDataLineChartCanvas, {
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
    this.changeDetectorRef.detectChanges();
  }

  sortNumericColumn(event: any): void {
    const column = event.field;
    const order = event.order;

    this.singleBuildDataArray.sort((dataItem1: any, dataItem2: any) => {
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

  mapRecommendedData(): void {
    this.recommendedProject = this.singleRecommendedData['recommended_projects'];
    this.recommendedUnit = this.singleRecommendedData['unit'];
    this.recommendedVoltage = this.singleRecommendedData['voltage'];
    this.recommendedTemp = this.singleRecommendedData['similar_temp'];

    if (this.recommendedProject && this.recommendedProject.length == 1) {
      this.selectedProject = this.recommendedProject;
    }
    else {
      this.fetchProjects();
    }
  }

  private async fetchProjects() {
    try {
      this.projectList = await this.portalService.getProjects();
    } catch (error) {
      console.log("Error retrieving project details.")
    }
  }

  async onProjectSelect(event: any) {
    this.selectedProject = event.data;

    try {
      const projectId = this.selectedProject.id;
      const data = await this.portalService.getVoltagesAndTemperatures(projectId);

      if (data) {
        this.voltageList = data.voltages;
        this.tempList = data.temperatures;
        this.unitList = data.units;
      }
    } catch (error) {
      console.error('Error retrieving voltages and temperatures:', error);
    }
  }

  onSubmit() {
    if (this.selectedProject && this.selectedVoltage && this.selectedTemp && this.selectedUnit) {
      const combinedList = {
        buildData: [this.singleBuildData[0][0]],
        project: this.selectedProject,
        voltage: this.selectedVoltage,
        temperature: this.selectedTemp,
        unit: this.selectedUnit
      };

      this.portalService.addToProject(combinedList)
        .then(response => {
          this.messageService.add({ severity: 'success', summary: 'Success', detail: response.message, life: 3000 });
          window.scrollTo(0, 0);
        })
        .catch(error => {
          console.error(error);
          this.messageService.add({ severity: 'error', summary: 'Error', detail: error.message, life: 3000 });
          window.scrollTo(0, 0);
        });
    }
    else {
      this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Please select a project.', life: 3000 });
      window.scrollTo(0, 0);
    }
  }
}
