import { Component, OnInit, OnDestroy, ViewChild, ElementRef, AfterViewInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { MessageService, SortEvent } from 'primeng/api';
import { PortalService } from 'src/app/portal/portal.service';
import { Chart } from 'chart.js/auto';
import * as echarts from 'echarts';
type EChartsOption = echarts.EChartsOption;

@Component({
  selector: 'app-view-data-page',
  templateUrl: './view-data-page.component.html',
  styleUrls: ['./view-data-page.component.scss']
})
export class ViewDataPageComponent implements OnInit {
  @ViewChild('chartCanvas') chartCanvas!: ElementRef;
  @ViewChild('lineChartCanvas') lineChartCanvas!: ElementRef;
  @ViewChild('voltageBoxPlot') voltageBoxPlot!: ElementRef;
  @ViewChild('tempBoxPlot') tempBoxPlot!: ElementRef;
  @ViewChild('runTimeBoxPlot') runTimeBoxPlot!: ElementRef;
  voltageBoxPlotChart!: echarts.ECharts;
  tempBoxPlotChart!: echarts.ECharts;
  runTimeBoxPlotChart!: echarts.ECharts;
  reccomendedData: any;
  recommendedUnit: any;
  recommendedProjectList: any;
  recommendedVoltage: any;
  recommendedTemp: any;
  isExist = false;
  missingVar = '';
  projects: any[] = [];
  selectedProject: any;
  selectedVoltage: any;
  selectedUnit: any;
  selectedTemp: any;
  projectVoltages: any[] = [];
  projectUnits: any[] = [];
  projectTemps: any[] = [];
  buildID: any;
  buildData: any;
  testCount = 0;
  passingPercentage = 0;
  testDuration: any;
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
  voltageBoxPlotKeys: any[] = ['VCCINT', 'VCC_PMC', 'VCC_PSFP', 'VCC_PSLP', 'VCC_RAM', 'VCC_SOC'];
  tempBoxPlotKeys: any[] = ['Max. Temp', 'Min. Temp'];

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private portalService: PortalService,
    private messageService: MessageService,
  ) { }

  ngOnInit(): void {
    this.route.queryParams.subscribe((params) => {
      this.buildID = params;
      this.fetchData();
    });
  }

  private async fetchProjects() {
    try {
      this.projects = await this.portalService.getProjects();
    } catch (error) {
      console.log("Error retrieving project details.")
    }
  }

  fetchData(): void {
    this.portalService.getBuildData(JSON.stringify(this.buildID))
      .then((buildData) => {
        this.buildData = buildData;
        this.createBuildDataMap();
        this.createTestResultMap();
        this.sendData();
        this.refParam = this.buildData[0];
        this.testCount = this.buildData.length;
        this.generateChart();
        this.getRecommendedData();
        this.createVoltageBoxPlot();
        this.createTempBoxPlot();
        this.createRunTimeBoxPlot();
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
    this.portalService.processTempLimit(this.buildData)
      .then(response => {
        let { "Max. Temp": maxTemp, "Min. Temp": minTemp } = response;
        maxTemp = parseFloat(maxTemp).toFixed(2);
        minTemp = parseFloat(minTemp).toFixed(2);
        this.refParam = { ...this.refParam, "Max. Temp": maxTemp, "Min. Temp": minTemp };
        this.testDuration = this.refParam["Test Duration"];
        this.highestMaxTemp = parseFloat(maxTemp);
        this.lowestMinTemp = parseFloat(minTemp);
      })
      .catch(error => {
        console.error(error);
      });
  }

  getRecommendedData(): void {
    this.portalService.getRecomendedData(this.buildData)
      .then(response => {
        this.reccomendedData = response;
        this.recommendedUnit = this.reccomendedData["unit"];
        this.recommendedProjectList = this.reccomendedData["recomended_projects"];
        this.recommendedVoltage = this.reccomendedData["voltage"];
        this.recommendedTemp = this.reccomendedData["similar_temp"];

        if (this.recommendedProjectList && this.recommendedVoltage && this.recommendedTemp) {
          this.selectedProject = this.recommendedProjectList[0];
          this.selectedUnit = this.recommendedUnit[0];
          this.selectedVoltage = this.recommendedVoltage[0];
          this.selectedTemp = this.recommendedTemp[0];
          this.isExist = true;
        }
        else {
          this.isExist = false;
          this.fetchProjects();
        }
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
      type: 'pie',
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
          datalabels: {
            display: false
          },
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
  }

  async onProjectSelect2(event: any) {
    this.selectedProject = event.data;

    try {
      const projectId = this.selectedProject.id;
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
    else {
      this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Please select a project.', life: 3000 });
      window.scrollTo(0, 0);
    }
  }

  async createVoltageBoxPlot() {
    var myChart = echarts.init(this.voltageBoxPlot.nativeElement);
    var option: EChartsOption;
    if (!Array.isArray(this.buildData)) {
      console.error('buildData is not an array.');
      return;
    }
    const data: any[] = [];
    const boxPlotData: number[][] = [];

    const keyValues: { [key: string]: number[] } = {};
    this.voltageBoxPlotKeys.forEach(key => {
      keyValues[key] = [];
    });

    await Promise.all(this.buildData.map(async item => {
      if (!this.voltageBoxPlotKeys.some(key => item[key] === null || item[key] === undefined || item[key] === 0)) {
        const dataPoint: any = { 'Test Name': item['Test Name'] };
        await Promise.all(this.voltageBoxPlotKeys.map(async key => {
          const value = item[key];
          const numericValue = parseFloat(value);

          dataPoint[key] = numericValue;

          keyValues[key].push(numericValue);
        }));

        data.push(dataPoint);
      }
    }));

    this.voltageBoxPlotKeys.forEach(key => {
      boxPlotData.push(keyValues[key]);
    });

    boxPlotData.forEach(subArray => {
      subArray.sort((a, b) => a - b);
    });

    const validData = boxPlotData.filter(subArray => subArray.length > 0);
    const iqrMultiplier = 1.5;
    const iqrData = validData.map(subArray => {
      const sortedArray = subArray.slice().sort((a, b) => a - b);
      const q1Index = Math.floor(sortedArray.length * 0.25);
      const q3Index = Math.floor(sortedArray.length * 0.75);
      const q1 = sortedArray[q1Index];
      const q3 = sortedArray[q3Index];
      const iqr = q3 - q1;
      return { q1, q3, iqr };
    });

    const lowerBounds = iqrData.map(data => {
      const multiplier = data.q1 < 0 ? 0.995 : 1.005;
      return data.q1 - iqrMultiplier * data.iqr * multiplier;
    });

    const upperBounds = iqrData.map(data => {
      const multiplier = data.q3 < 0 ? 0.995 : 1.005;
      return data.q3 + iqrMultiplier * data.iqr * multiplier;
    });

    const minDataValue = (
      Math.min(
        validData.reduce((min, subArray) => Math.min(...subArray, min), Infinity),
        ...lowerBounds
      ) * 0.995
    ).toFixed(2);

    const maxDataValue = (
      Math.max(
        validData.reduce((max, subArray) => Math.max(...subArray, max), -Infinity),
        ...upperBounds
      ) * 1
    ).toFixed(2);


    const voltageBoxPlotKeys = this.voltageBoxPlotKeys;
    option = {
      dataset: [
        {
          source: boxPlotData
        },
        {
          transform: {
            type: 'boxplot',
            config: { itemNameFormatter: this.voltageBoxPlotKeys }
          }
        },
        {
          fromDatasetIndex: 1,
          fromTransformResult: 1
        }
      ],
      tooltip: {
        trigger: 'item',
        axisPointer: {
          type: 'shadow'
        }
      },
      xAxis: {
        type: 'category',
        boundaryGap: true,
        nameGap: 30,
        splitLine: {
          show: true
        },
        axisLabel: {
          formatter: function (value: string, index: number) {
            return voltageBoxPlotKeys[index];
          }
        },
      },
      yAxis: {
        type: 'value',
        name: 'Temperaure (°C)',
        splitArea: {
          show: true
        },
        min: minDataValue,
        max: maxDataValue
      },
      series: [
        {
          name: 'boxplot',
          type: 'boxplot',
          datasetIndex: 1,
          tooltip: {
            formatter: function (param: any) {
              const statsLabels = ['Upper', 'Q3', 'Median', 'Q1', 'Lower'];
              const startIndex = 1;
              const endIndex = startIndex + statsLabels.length - 1;

              let tooltipContent = statsLabels
                .map((label, index) => {
                  return `${label}: ${param.data[endIndex - index].toFixed(3)}`;
                })
                .join('<br/>');
              return tooltipContent;
            }
          }
        },
        {
          name: 'outlier',
          type: 'scatter',
          datasetIndex: 2,
          itemStyle: {
            color: 'rgba(255, 0, 0, 0.5)',
          }
        }
      ]
    };
    option && myChart.setOption(option);
  }

  async createTempBoxPlot(): Promise<void> {
    var myChart = echarts.init(this.tempBoxPlot.nativeElement);
    var option: EChartsOption;

    if (!Array.isArray(this.buildData)) {
      console.error('buildData is not an array.');
      return;
    }

    const data: any[] = [];
    const boxPlotData: number[][] = [];
    const keyValues: { [key: string]: number[] } = {};
    this.tempBoxPlotKeys.forEach(key => {
      keyValues[key] = [];
    });
    await Promise.all(this.buildData.map(async item => {
      if (!this.tempBoxPlotKeys.some(key => item[key] === null || item[key] === undefined || item[key] === 0)) {
        const dataPoint: any = { 'Test Name': item['Test Name'] };
        await Promise.all(this.tempBoxPlotKeys.map(async tempKey => {
          const value = item[tempKey];
          const numericValue = parseFloat(value);
          dataPoint[tempKey] = numericValue;
          keyValues[tempKey].push(numericValue);
        }));
        data.push(dataPoint);
      }
    }));

    this.tempBoxPlotKeys.forEach(key => {
      boxPlotData.push(keyValues[key]);
    });

    boxPlotData.forEach(subArray => {
      subArray.sort((a, b) => a - b);
    });

    const validData = boxPlotData.filter(subArray => subArray.length > 0);
    const iqrMultiplier = 1.5;
    const iqrData = validData.map(subArray => {
      const sortedArray = subArray.slice().sort((a, b) => a - b);
      const q1Index = Math.floor(sortedArray.length * 0.25);
      const q3Index = Math.floor(sortedArray.length * 0.75);
      const q1 = sortedArray[q1Index];
      const q3 = sortedArray[q3Index];
      const iqr = q3 - q1;
      return { q1, q3, iqr };
    });

    const lowerBounds = iqrData.map(data => {
      const multiplier = data.q1 < 0 ? 0.98 : 1.02;
      return data.q1 - iqrMultiplier * data.iqr * multiplier;
    });

    const upperBounds = iqrData.map(data => {
      const multiplier = data.q3 < 0 ? 0.98 : 1.02;
      return data.q3 + iqrMultiplier * data.iqr * multiplier;
    });

    const minDataValue = Math.min(
      validData.reduce((min, subArray) => Math.min(...subArray, min), Infinity),
      ...lowerBounds
    ).toFixed(2);

    const maxDataValue = Math.max(
      validData.reduce((max, subArray) => Math.max(...subArray, max), -Infinity),
      ...upperBounds
    ).toFixed(2);

    option = {
      dataset: [
        {
          source: boxPlotData
        },
        {
          transform: {
            type: 'boxplot',
            config: { itemNameFormatter: this.tempBoxPlotKeys }
          }
        },
        {
          fromDatasetIndex: 1,
          fromTransformResult: 1
        }
      ],
      tooltip: {
        trigger: 'item',
        axisPointer: {
          type: 'shadow'
        }
      },
      xAxis: {
        type: 'category',
        boundaryGap: true,
        nameGap: 30,
        splitLine: {
          show: true
        },
        axisLabel: {
          formatter: function (value, index) {
            if (index === 0) {
              return 'Max. Temp';
            } else if (index === 1) {
              return 'Min. Temp';
            }
            return value;
          }
        },
      },
      yAxis: {
        type: 'value',
        name: 'Temperature (°C)',
        splitArea: {
          show: true
        },
        min: minDataValue,
        max: maxDataValue
      },
      series: [
        {
          name: 'boxplot',
          type: 'boxplot',
          datasetIndex: 1,
          tooltip: {
            formatter: function (param: any) {
              const statsLabels = ['Upper', 'Q3', 'Median', 'Q1', 'Lower'];
              const startIndex = 1;
              const endIndex = startIndex + statsLabels.length - 1;

              let tooltipContent = statsLabels
                .map((label, index) => {
                  return `${label}: ${param.data[endIndex - index].toFixed(3)}`;
                })
                .join('<br/>');
              return tooltipContent;
            }
          }
        },
        {
          name: 'outlier',
          type: 'scatter',
          datasetIndex: 2,
          itemStyle: {
            color: 'rgba(255, 0, 0, 0.5)',
          }
        }
      ]
    };
    option && myChart.setOption(option);
  }

  async createRunTimeBoxPlot(): Promise<void> {
    var myChart = echarts.init(this.runTimeBoxPlot.nativeElement);
    var option: EChartsOption;

    if (!Array.isArray(this.buildData)) {
      console.error('buildData is not an array.');
      return;
    }

    const runTimeData: number[] = [];
    await Promise.all(this.buildData.map(async item => {
      const runTimeValue = parseFloat(item["Run Time"]);
      runTimeData.push(runTimeValue);
    }));
    const iqrMultiplier = 1.5;
    const sortedRunTimeData = runTimeData.slice().sort((a, b) => a - b);
    const q1Index = Math.floor(sortedRunTimeData.length * 0.25);
    const q3Index = Math.floor(sortedRunTimeData.length * 0.75);
    const q1 = sortedRunTimeData[q1Index];
    const q3 = sortedRunTimeData[q3Index];
    const iqr = q3 - q1;
    const lowerBound = q1 - iqrMultiplier * iqr;
    const upperBound = q3 + iqrMultiplier * iqr;
    const maxRunTime = Math.max(...runTimeData);
    const minRunTime = Math.min(...runTimeData);

    let finalMaxRunTime = 0;
    let finalMinRunTime = 0;

    if (minRunTime > 0 && maxRunTime > 0) {
      finalMaxRunTime = parseFloat((minRunTime * 0.95).toFixed(2));
      finalMinRunTime = parseFloat((maxRunTime * 1.05).toFixed(2));
    } else if (minRunTime < 0 && maxRunTime < 0) {
      finalMaxRunTime = parseFloat((minRunTime * 1.05).toFixed(2));
      finalMinRunTime = parseFloat((maxRunTime * 0.95).toFixed(2));
    }

    option = {
      dataset: [
        {
          source: [sortedRunTimeData]
        },
        {
          transform: {
            type: 'boxplot',
            config: { itemNameFormatter: this.tempBoxPlotKeys }
          }
        },
        {
          fromDatasetIndex: 1,
          fromTransformResult: 1
        }
      ],
      tooltip: {
        trigger: 'item',
        axisPointer: {
          type: 'shadow'
        }
      },
      xAxis: {
        type: 'category',
      },
      yAxis: {
        type: 'value',
        name: 'Run Time (s)',
        splitArea: {
          show: true
        },
        min: finalMaxRunTime,
        max: finalMinRunTime
      },
      series: [
        {
          name: 'boxplot',
          type: 'boxplot',
          datasetIndex: 1,
          tooltip: {
            formatter: function (param: any) {
              const statsLabels = ['Upper', 'Q3', 'Median', 'Q1', 'Lower'];
              const startIndex = 1;
              const endIndex = startIndex + statsLabels.length - 1;

              let tooltipContent = statsLabels
                .map((label, index) => {
                  return `${label}: ${param.data[endIndex - index].toFixed(3)}`;
                })
                .join('<br/>');
              return tooltipContent;
            }
          }
        },
        {
          name: 'outlier',
          type: 'scatter',
          datasetIndex: 2,
          itemStyle: {
            color: 'rgba(255, 0, 0, 0.5)',
          }
        }
      ]
    };
    option && myChart.setOption(option);
  }
}
