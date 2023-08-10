import { Component, ElementRef, Input, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { MessageService } from 'primeng/api';
import { PortalService } from 'src/app/portal/portal.service';
import { Chart } from 'chart.js/auto';

@Component({
  selector: 'app-data-tab',
  templateUrl: './data-tab.component.html',
  styleUrls: ['./data-tab.component.scss']
})
export class DataTabComponent implements OnInit {
  @Input() buildID: string | undefined;
  @Input() combinedBuildData: any[] = [];
  @ViewChild('chartCanvas') chartCanvas!: ElementRef;
  @ViewChild('lineChartCanvas') lineChartCanvas!: ElementRef;
  buildData: any;
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
  refParam: any;
  highestMaxTemp!: number;
  lowestMinTemp!: number;
  testCount = 0;
  passCount = 0;
  failCount = 0;
  notRunCount = 0;
  passingPercentage = 0;
  summaryData: { label: string, value: number }[] = [];
  reccomendedData: any;
  recommendedUnit: any;
  recommendedProjectList: any;
  recommendedVoltage: any;
  recommendedTemp: any;
  missingVar = '';
  isExist = false;
  selectedProject: any;
  selectedVoltage: any;
  selectedUnit: any;
  selectedTemp: any;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private portalService: PortalService,
    private messageService: MessageService,
  ) { }

  ngOnInit(): void {
    this.loadData();
  }

  loadData(): void {
    if (this.buildID) {
      this.fetchData();
    } else if (this.combinedBuildData && this.combinedBuildData.length > 0) {
      this.sendCombinedData();
    }
  }


  fetchData(): void {
    this.portalService.getBuildData(JSON.stringify({ "buildID": this.buildID }))
      .then((buildData) => {
        this.buildData = buildData;
        this.createBuildDataMap();
        this.createTestResultMap();
        this.sendData();
        this.refParam = this.buildData[0];
        this.testCount = this.buildData.length;
        this.generateChart();
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

  private async fetchProjects() {
    try {
      this.projects = await this.portalService.getProjects();
    } catch (error) {
      console.log("Error retrieving project details.")
    }
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
    this.portalService.processTempLimit(this.buildData)
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

  sendCombinedData(): void {
    this.portalService.processTempLimit(this.combinedBuildData)
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
    this.processCombinedData();
    this.buildData = this.combinedBuildData;
    this.refParam = this.buildData[0];
  }

  processCombinedData(): void {
    this.testCount = this.combinedBuildData.length;
    this.passCount = this.combinedBuildData.filter((item: any) => item['Test Result'] === 'PASS').length;
    this.failCount = this.combinedBuildData.filter((item: any) => item['Test Result'] === 'FAIL').length;
    this.notRunCount = this.combinedBuildData.filter((item: any) => item['Test Result'] === 'NOT-RUN').length;
    this.summaryData = [
      { label: 'Pass', value: this.passCount },
      { label: 'Fail', value: this.failCount },
      { label: 'Not-Run', value: this.notRunCount }
    ];
  }

  getPercentage(count: number): number {
    if (this.testCount === 0) {
      return 0;
    }

    const percentValue = ((count / this.testCount) * 100).toFixed(2);
    return parseFloat(percentValue);
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

}
