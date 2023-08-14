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
  recommendedProjectList: any;
  recommendedVoltage: any;
  recommendedTemp: any;
  missingVar = '';
  isExist = false;
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
    console.log(this.combinedSummaryData);
    if (this.singleBuildData.length > 0) {
      this.singleBuildDataArray = this.singleBuildData.flatMap(obj => Object.values(obj));
      console.log(this.singleBuildDataArray);
      this.mapTestParam();
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
    console.log(chartBuildData);
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
    console.log("HERE")
    const singleDataPieCanvas = this.singleChartCanvas?.nativeElement.getContext('2d');
    const singleDataLineChartCanvas = this.singleLineChartCanvas?.nativeElement.getContext('2d');

    if (!singleDataPieCanvas || !singleDataLineChartCanvas) {
      return;
    }

    this.testCount = this.singleBuildDataArray.length;
    console.log(this.singleBuildDataArray);
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

}
