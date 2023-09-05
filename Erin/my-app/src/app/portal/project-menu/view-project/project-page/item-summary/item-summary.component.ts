import { Component, ElementRef, OnInit, ViewChild, AfterViewInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { PortalService } from 'src/app/portal/portal.service';
import { Chart, ChartData, ChartDataset, ChartOptions, ChartType } from 'chart.js/auto';
import 'chartjs-plugin-datalabels';
import ChartDataLabels from 'chartjs-plugin-datalabels';
Chart.register(ChartDataLabels);

@Component({
  selector: 'app-item-summary',
  templateUrl: './item-summary.component.html',
  styleUrls: ['./item-summary.component.scss']
})
export class ItemSummaryComponent implements OnInit {
  data: any;
  summaryData: any;
  summaryItem: any;
  category: any;
  projectID: any;
  unitList: any[] = [];

  // corner category 
  @ViewChild('cornerProgressChart') cornerProgressChartRef!: ElementRef;
  @ViewChild('cornerVsVoltageChart') cornerVsVoltageChartRef!: ElementRef;
  @ViewChild('unitProgressChart') unitProgressChartRef!: ElementRef;
  @ViewChild('tempProgressChart') tempProgressChartRef!: ElementRef;
  cornerProgressChart: Chart | undefined;
  cornerVsVoltageChart: Chart | undefined;
  unitProgressChart: Chart | undefined;
  tempProgressChart: Chart | undefined;
  cornerVsVoltageTableData: any[] = [];
  unitProgressData: any[] = [];
  testInstancesData: any[] = [];
  cornerTemperatureData: any[] = [];
  cornerTemperatureDataArray: any[] = [];
  voltageNames: any[] = [];
  headers: any[] = [];

  // voltage category
  @ViewChild('voltageProgressChart') voltageProgressChartRef!: ElementRef;
  @ViewChild('voltageVsCornerChart') voltageVsCornerChartRef!: ElementRef;
  @ViewChild('voltagePerUnitChart') voltagePerUnitChartRef!: ElementRef;
  @ViewChild('voltageVsTempChart') voltageVsTempChartRef!: ElementRef;
  voltageProgressChart: Chart | undefined;
  voltageVsCornerChart: Chart | undefined;
  voltagePerUnitChart: Chart | undefined;
  voltageVsTempChart: Chart | undefined;
  voltageResults: any;
  voltageVsCornerData: any;
  voltageVsUnitResults: any;
  voltageVsCornerTableData: any;
  voltagePerUnitTableData: any;
  voltageTempData: any[] = [];
  cornerNames: any[] = [];
  unitNames: any[] = [];

  // project category
  @ViewChild('unitChart') outcomeUnitChartRef!: ElementRef;
  @ViewChild('unitPieChart') outcomeUnitPieChartRef!: ElementRef;
  @ViewChild('unitRatioChart') unitRatioChartRef!: ElementRef;
  @ViewChild('voltageChart') outcomeVoltageChartRef!: ElementRef;
  @ViewChild('voltagePieChart') outcomeVoltagePieChartRef!: ElementRef;
  @ViewChild('voltageRatioChart') voltageRatioChartRef!: ElementRef;
  @ViewChild('tempChart') outcomeTempChartRef!: ElementRef;
  @ViewChild('tempPieChart') tempPieChartRef!: ElementRef;
  @ViewChild('tempRatioChart') tempRatioChartRef!: ElementRef;
  @ViewChild('cornerChart') outcomeCornerChartRef!: ElementRef;
  @ViewChild('cornerPieChart') cornerPieChartRef!: ElementRef;
  @ViewChild('cornerRatioChart') cornerRatioChartRef!: ElementRef;
  outcomeUnitChart: Chart | undefined;
  outcomeUnitPieChart: Chart | undefined;
  unitRatioChart: Chart | undefined;
  outcomeUnitTableData: any[] = [];
  unitRatioData: any;
  unitRatioTableData: any[] = [];
  unitRatioHeaders: any[] = [];
  outcomeVoltageChart: Chart | undefined;
  outcomeVoltagePieChart: Chart | undefined;
  voltageRatioChart: Chart | undefined;
  outcomeVoltageTableData: any[] = [];
  outcomeTempChart: Chart | undefined;
  tempPieChart: Chart | undefined;
  tempRatioChart: Chart | undefined;
  tempRatioData: any;
  tempNames: any[] = [];
  tempRatioHeaders: any[] = [];
  outcomeTempTableData: any[] = [];
  tempRatioTableData: any[] = [];
  outcomeCornerChart: Chart | undefined;
  cornerPieChart: Chart | undefined;
  cornerRatioChart: Chart | undefined;
  unitOutcomeData: any;
  voltageOutcomeData: any;
  voltageRatioData: any;
  voltageRatioTableData: any[] = [];
  voltageRatioHeaders: any[] = [];
  tempOutcomeData: any;
  cornerOutcomeData: any;
  cornerRatioData: any;
  cornerRatioTableData: any[] = [];
  cornerRatioHeaders: any[] = [];
  outcomeCornerTableData: any[] = [];
  testInstancesOutcomeData: any[] = [];
  testResults: any[] = [
    "Build ID",
    "S-Suite",
    "Suite",
    "Test Name",
    "Result",
    "Max. Temp",
    "Min. Temp",
    "Run Time",
    "VCCINT",
    "VCC_PMC",
    "VCC_PSFP",
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
  ) { }

  async ngOnInit(): Promise<void> {
    this.route.queryParams.subscribe(async (params) => {
      this.data = JSON.parse(params['data']);
      this.category = this.data.category;
      this.summaryItem = this.data.summaryItem;
      this.projectID = this.data.projectID;

      await this.retrieveItemSummary();
      if (this.category === 'corner') {
        this.createCornerProgressChart();
        this.createCornerVsVoltageChart();
        this.createCornerUnitProgressChart();
        this.createCornerVsTempProgressChart();
      } else if (this.category === 'voltage') {
        this.createVoltageProgressChart();
        this.createVoltageVsCornerChart();
        this.createVoltagePerUnitChart();
        this.createVoltageVsTempProgressChart();
      } else if (this.category === 'project-result') {
        this.createOutcomeVoltageChart();
        this.createOutcomeUnitChart();
        this.createOutcomeTempChart();
        this.createOutcomeCornerChart();
      }
    });
  }

  async retrieveItemSummary(): Promise<void> {
    this.summaryData = await this.portalService.retrieveItemSummary(this.data);
    if (this.category === 'corner') {
      this.testInstancesData = this.summaryData.test_instances_data;
      this.cornerTemperatureData = this.summaryData.temperature_results;
    } else if (this.category === 'voltage') {
      this.unitList = this.summaryData.units;
      this.testInstancesData = this.summaryData.test_instances_data;
      this.voltageResults = this.summaryData.voltage_test_results;
      this.voltageVsCornerData = this.summaryData.corner_vs_voltage_results.corner_results;
      this.voltageVsUnitResults = this.summaryData.corner_vs_voltage_results.unit_results;
      this.unitNames = Object.keys(this.voltageVsUnitResults);
      this.cornerNames = this.summaryData.corner_names;
      this.voltageTempData = this.summaryData.temperature_results;
    } else if (this.category === 'project-result') {
      this.unitOutcomeData = this.summaryData.outcome_per_unit;
      this.voltageOutcomeData = this.summaryData.outcome_per_voltage;
      this.tempOutcomeData = this.summaryData.outcome_per_temperature;
      this.cornerOutcomeData = this.summaryData.outcome_per_corner;
      this.testInstancesOutcomeData = this.summaryData.test_instances;
      this.voltageRatioData = this.summaryData.voltage_test_count;
      this.cornerRatioData = this.summaryData.corner_test_count;
      this.unitRatioData = this.summaryData.unit_test_count;
      this.tempRatioData = this.summaryData.temperature_test_count;
    }
  }

  createCornerProgressChart() {
    if (!this.cornerProgressChartRef) {
      console.log('cornerProgressChartRef is not defined');
      return;
    }
    else if (!this.summaryData || !this.summaryData.corner_test_results) {
      console.log('summaryData is not defined');
      return;
    }

    if (this.cornerProgressChart) {
      this.cornerProgressChart.destroy();
    }

    const cornerTestCount = this.summaryData.corner_test_results.total_corner_test_count
    const passData = +((this.summaryData.corner_test_results.pass_count / cornerTestCount) * 100).toFixed(2);
    const failData = +((this.summaryData.corner_test_results.fail_count / cornerTestCount) * 100).toFixed(2);
    const notrun = +((this.summaryData.corner_test_results.not_run_count / cornerTestCount) * 100).toFixed(2);

    const chartData = {
      labels: ['PASS', 'FAIL', 'NOT-RUN'],
      datasets: [{
        data: [passData, failData, notrun],
        backgroundColor: ['rgba(75, 192, 192, 0.6)', 'rgba(255, 99, 132, 0.6)', 'rgba(255, 206, 86, 0.6)'],
      }],
    }

    const chartOptions = {
      responsive: true,
      maintainAspectRatio: true,
      plugins: {
        datalabels: {
          color: 'black',
          display: true,
          formatter: (value: any) => {
            return value + '%';
          }
        },
      },
    };

    const canvasElement: HTMLCanvasElement = this.cornerProgressChartRef.nativeElement;
    this.cornerProgressChart = new Chart(canvasElement, {
      type: 'pie' as ChartType,
      data: chartData,
      options: chartOptions
    })
  }

  createCornerVsVoltageChart() {
    if (!this.cornerVsVoltageChartRef) {
      console.log('cornerVsVoltageChartRef is not defined');
      return;
    }

    const data = this.summaryData.corner_vs_voltage_results
    this.voltageNames = Object.keys(data);
    const datasets = [];
    const resultTypes = ['PASS', 'FAIL', 'NOT-RUN'];
    const backgroundColors: { [key: string]: string } = {
      'PASS': 'rgba(75, 192, 192, 0.6)',
      'FAIL': 'rgba(255, 99, 132, 0.6)',
      'NOT-RUN': 'rgba(255, 206, 86, 0.6)',
    };

    for (const resultType of resultTypes) {
      const dataset = {
        label: resultType,
        data: this.voltageNames.map(voltage => {
          const voltageData = data[voltage];
          const totalCount = voltageData.PASS + voltageData.FAIL + voltageData['NOT-RUN'];
          const count = voltageData[resultType];
          return totalCount === 0 ? 0 : ((count / totalCount) * 100).toFixed(2);
        }),
        backgroundColor: backgroundColors[resultType],
      };
      datasets.push(dataset);
    }

    const chartData = {
      labels: this.voltageNames,
      datasets: datasets,
    };

    const chartOptions = {
      scales: {
        x: {
          stacked: true,
        },
        y: {
          stacked: true,
        },
      },
      plugins: {
        datalabels: {
          color: 'black',
          display: (context: any) => {
            return context.dataset.data[context.dataIndex] > 0;
          },
          formatter: (value: any) => {
            return value + '%';
          }
        },
      },
    };

    const canvasElement: HTMLCanvasElement = this.cornerVsVoltageChartRef.nativeElement;
    const ctx = canvasElement.getContext('2d');
    if (ctx) {
      new Chart(ctx, {
        type: 'bar',
        data: chartData,
        options: chartOptions,
      });
    } else {
      console.log('Canvas context is null');
    }

    this.headers = ["Category", ...this.voltageNames];
    const categories = ["PASS", "FAIL", "NOT-RUN"];
    for (const resultType of categories) {
      const row = [resultType];
      for (const voltageName of this.voltageNames) {
        const count = data[voltageName][resultType];
        row.push(count);
      }
      this.cornerVsVoltageTableData.push(row);
    }
  }

  createCornerUnitProgressChart() {
    if (!this.unitProgressChartRef) {
      console.log('unitProgressChartChartRef is not defined');
      return;
    }
    else if (!this.summaryData || !this.summaryData.unit_test_counts) {
      console.log('summaryData is not defined');
      return;
    }

    const data = this.summaryData.unit_test_counts;
    const units = Object.keys(data);
    const resultTypes = ['PASS', 'FAIL', 'NOT-RUN'];
    const backgroundColors: { [key: string]: string } = {
      'PASS': 'rgba(75, 192, 192, 0.6)',
      'FAIL': 'rgba(255, 99, 132, 0.6)',
      'NOT-RUN': 'rgba(255, 206, 86, 0.6)',
    };
    const datasets = resultTypes.map(resultType => ({
      label: resultType,
      data: units.map(unit => {
        const count = data[unit][resultType];
        const totalCount = resultTypes.reduce((sum, type) => sum + data[unit][type], 0);
        const percentage = (count / totalCount) * 100;
        return +percentage.toFixed(2);
      }),
      backgroundColor: backgroundColors[resultType],
    }));

    const chartData = {
      labels: units,
      datasets: datasets,
    };

    const chartOptions = {
      responsive: true,
      maintainAspectRatio: true,
      scales: {
        x: {
          stacked: true,
        },
        y: {
          stacked: true,
        },
      },
      plugins: {
        datalabels: {
          color: 'black',
          display: (context: any) => {
            return context.dataset.data[context.dataIndex] > 0;
          },
          formatter: (value: any) => {
            return value + '%';
          }
        },
      },
    };

    const canvasElement: HTMLCanvasElement = this.unitProgressChartRef.nativeElement;
    this.unitProgressChart = new Chart(canvasElement, {
      type: 'bar',
      data: chartData,
      options: chartOptions,
    });

    const dataArray = Object.entries(this.summaryData.unit_test_counts).map(([unitNumber, values]: [string, any]) => ({
      Name: unitNumber,
      PASS: values.PASS,
      FAIL: values.FAIL,
      'NOT-RUN': values['NOT-RUN'],
    }));
    this.unitProgressData = dataArray;
  }

  createCornerVsTempProgressChart() {
    const temperatureArray = [];
    for (const temperatureValue in this.cornerTemperatureData) {
      const temperatureCounts = this.cornerTemperatureData[temperatureValue];
      const row = [temperatureValue, temperatureCounts.PASS, temperatureCounts.FAIL, temperatureCounts['NOT-RUN']];
      temperatureArray.push(row);
    }
    this.cornerTemperatureData = temperatureArray;
    if (!this.tempProgressChartRef) {
      console.log('tempProgressChartRef is not defined');
      return;
    } else if (!this.summaryData || !this.summaryData.temperature_results) {
      console.log('summaryData is not defined');
      return;
    }

    const data = this.summaryData.temperature_results;
    const resultTypes = ['PASS', 'FAIL', 'NOT-RUN'];
    const backgroundColors: { [key: string]: string } = {
      'PASS': 'rgba(75, 192, 192, 0.6)',
      'FAIL': 'rgba(255, 99, 132, 0.6)',
      'NOT-RUN': 'rgba(255, 206, 86, 0.6)',
    }

    const datasets = resultTypes.map(resultType => ({
      label: resultType,
      data: Object.keys(data).map(temperature => {
        const count = data[temperature][resultType];
        const totalCount = resultTypes.reduce((sum, type) => sum + data[temperature][type], 0);
        const percentage = (count / totalCount) * 100;
        return +percentage.toFixed(2);
      }),
      backgroundColor: backgroundColors[resultType],
    }))

    const chartData = {
      labels: Object.keys(data),
      datasets: datasets,
    }

    const chartOptions = {
      responsive: true,
      maintainAspectRatio: true,
      scales: {
        x: {
          stacked: true,
        },
        y: {
          stacked: true,
          max: 100
        },
      },
      plugins: {
        datalabels: {
          color: 'black',
          display: (context: any) => {
            return context.dataset.data[context.dataIndex] > 0;
          },
          formatter: (value: any) => {
            return value.toFixed(2) + '%';
          }
        },
      },
    }

    const canvasElement: HTMLCanvasElement = this.tempProgressChartRef.nativeElement;
    this.tempProgressChart = new Chart(canvasElement, {
      type: 'bar',
      data: chartData,
      options: chartOptions
    })
  }

  createVoltageProgressChart() {
    if (!this.voltageProgressChartRef) {
      console.log('voltageProgressChartRef is not defined');
      return;
    }
    else if (!this.summaryData || !this.voltageResults) {
      console.log('voltageResults is not defined');
      return;
    }

    if (this.voltageProgressChart) {
      this.voltageProgressChart.destroy();
    }

    const voltageTestCount = this.voltageResults.total_voltage_test_count
    const passData = +((this.voltageResults.total_voltage_pass_count / voltageTestCount) * 100).toFixed(2);
    const failData = +((this.voltageResults.total_voltage_fail_count / voltageTestCount) * 100).toFixed(2);
    const notrun = +((this.voltageResults.total_voltage_not_run_count / voltageTestCount) * 100).toFixed(2);

    const chartData = {
      labels: ['PASS', 'FAIL', 'NOT-RUN'],
      datasets: [{
        data: [passData, failData, notrun],
        backgroundColor: ['rgba(75, 192, 192, 0.6)', 'rgba(255, 99, 132, 0.6)', 'rgba(255, 206, 86, 0.6)'],
      }],
    }

    const chartOptions = {
      responsive: true,
      maintainAspectRatio: true,
      plugins: {
        datalabels: {
          color: 'black',
          display: true,
          formatter: (value: any) => {
            return value + '%';
          }
        },
      },
    }

    const canvasElement: HTMLCanvasElement = this.voltageProgressChartRef.nativeElement;
    this.voltageProgressChart = new Chart(canvasElement, {
      type: 'pie' as ChartType,
      data: chartData,
      options: chartOptions
    })
  }

  createVoltageVsCornerChart() {
    if (!this.voltageVsCornerChartRef) {
      console.log('voltageVsCornerChartRef is not defined');
      return;
    }
    else if (!this.summaryData || !this.voltageResults) {
      console.log('voltageResults is not defined');
      return;
    }

    if (this.voltageVsCornerChart) {
      this.voltageVsCornerChart.destroy();
    }

    const data = this.voltageVsCornerData
    this.cornerNames = Object.keys(data);
    const resultTypes = ['PASS', 'FAIL', 'NOT-RUN'];
    const backgroundColors: { [key: string]: string } = {
      'PASS': 'rgba(75, 192, 192, 0.6)',
      'FAIL': 'rgba(255, 99, 132, 0.6)',
      'NOT-RUN': 'rgba(255, 206, 86, 0.6)',
    }

    const cornerSums = this.cornerNames.map(corner =>
      resultTypes.reduce((sum, resultType) => sum + data[corner][resultType], 0)
    );

    const dataset = resultTypes.map(resultType => ({
      label: resultType,
      data: this.cornerNames.map((corner, index) =>
        (data[corner][resultType] / cornerSums[index]) * 100
      ),
      backgroundColor: backgroundColors[resultType],
    }));

    const chartData = {
      labels: this.cornerNames,
      datasets: dataset,
    }

    const options = {
      responsive: true,
      maintainAspectRatio: true,
      scales: {
        x: {
          stacked: true,
        },
        y: {
          stacked: true,
          max: 100
        },
      },
      plugins: {
        datalabels: {
          color: 'black',
          display: (context: any) => {
            return context.dataset.data[context.dataIndex] > 0;
          },
          formatter: (value: any) => {
            return value.toFixed(2) + '%';
          }
        },
      },
    }

    const canvasElement: HTMLCanvasElement = this.voltageVsCornerChartRef.nativeElement;
    this.voltageVsCornerChart = new Chart(canvasElement, {
      type: 'bar',
      data: chartData,
      options: options
    })

    this.voltageVsCornerTableData = resultTypes.map(resultType => ({
      Category: resultType,
      ...Object.fromEntries(
        this.cornerNames.map((corner, index) => [
          corner,
          data[corner][resultType]
        ])
      )
    }));
  }

  createVoltagePerUnitChart() {
    if (!this.voltagePerUnitChartRef) {
      console.log('voltagePerUnitChartRef is not defined');
      return;
    }
    else if (!this.summaryData || !this.voltageResults) {
      console.log('voltageResults is not defined');
      return;
    }

    if (this.voltagePerUnitChart) {
      this.voltagePerUnitChart.destroy();
    }

    const data = this.voltageVsUnitResults;
    const resultTypes = ['PASS', 'FAIL', 'NOT-RUN'];
    const backgroundColors: { [key: string]: string } = {
      'PASS': 'rgba(75, 192, 192, 0.6)',
      'FAIL': 'rgba(255, 99, 132, 0.6)',
      'NOT-RUN': 'rgba(255, 206, 86, 0.6)',
    }

    const datasets = resultTypes.map(resultType => ({
      label: resultType,
      data: Object.keys(data).map(unit => {
        const count = data[unit][resultType];
        const totalCount = resultTypes.reduce((sum, type) => sum + data[unit][type], 0);
        const percentage = (count / totalCount) * 100;
        return +percentage.toFixed(2);
      }),
      backgroundColor: backgroundColors[resultType],
    }))

    const chartData = {
      labels: this.unitNames,
      datasets: datasets,
    }

    const chartOptions = {
      responsive: true,
      maintainAspectRatio: true,
      scales: {
        x: {
          stacked: true,
        },
        y: {
          stacked: true,
          max: 100
        },
      },
      plugins: {
        datalabels: {
          color: 'black',
          display: (context: any) => {
            return context.dataset.data[context.dataIndex] > 0;
          },
          formatter: (value: any) => {
            return value.toFixed(2) + '%';
          }
        },
      },
    }

    const canvasElement: HTMLCanvasElement = this.voltagePerUnitChartRef.nativeElement;
    this.voltagePerUnitChart = new Chart(canvasElement, {
      type: 'bar',
      data: chartData,
      options: chartOptions
    })

    this.voltagePerUnitTableData = resultTypes.map(resultType => ({
      Category: resultType,
      ...Object.fromEntries(
        Object.keys(data).map(unit => [
          unit,
          data[unit][resultType]
        ])
      )
    }))
  }

  createUnitPieChart() {
    if (!this.outcomeUnitPieChartRef) {
      console.log('outcomeUnitPieChartRef is not defined');
      return;
    }

    if (this.outcomeUnitPieChart) {
      this.outcomeUnitPieChart.destroy();
    }

    this.unitNames = Object.keys(this.unitOutcomeData);
    this.outcomeUnitTableData = Object.values(this.unitOutcomeData).map(subArray => (subArray as any[]).length);
    const canvasElement: HTMLCanvasElement = this.outcomeUnitPieChartRef.nativeElement;
    const backgroundColors = this.outcomeUnitTableData.map(() => {
      const opacity = 0.5;
      const yellowChannel = Math.floor(Math.random() * 100) + 155;
      const randomColor = `rgba(${yellowChannel}, ${yellowChannel}, ${Math.floor(
        Math.random() * 100
      )}, ${opacity})`;
      return randomColor;
    });

    this.outcomeUnitPieChart = new Chart(canvasElement, {
      type: 'pie' as ChartType,
      data: {
        labels: this.unitNames.map(label => label.slice(-4)),
        datasets: [
          {
            label: 'Fail Count',
            data: this.outcomeUnitTableData,
            backgroundColor: backgroundColors,
          },
        ],
      },
      options: {
        plugins: {
          datalabels: {
            color: 'black',
            display: (context: any) => {
              return context.dataset.data[context.dataIndex] > 0;
            },
          },
          legend: {
            labels: {
              color: 'black',
            }
          },
        },
      },
    })

    this.outcomeUnitTableData = this.unitNames.map((unitName, index) => ({
      name: unitName,
      value: this.outcomeUnitTableData[index]
    }))
  }

  createUnitRatioChart() {
    if (!this.unitRatioChartRef) {
      console.log('unitRatioChartRef is not defined');
      return;
    }

    if (this.unitRatioChart) {
      this.unitRatioChart.destroy();
    }

    this.unitRatioHeaders = Object.keys(this.unitRatioData);
    const resultTypes = ['TOTAL', 'FAIL'];
    const backgroundColors: { [key: string]: string } = {
      'TOTAL': 'rgba(75, 192, 192, 0.6)',
      'FAIL': 'rgba(255, 99, 132, 0.6)',
    }

    const datasets = resultTypes.map(resultType => ({
      label: resultType,
      data: Object.keys(this.unitRatioData).map(unit => {
        const count = this.unitRatioData[unit][resultType];
        const totalCount = resultTypes.reduce((sum, type) => sum + this.unitRatioData[unit][type], 0);
        const percentage = (count / totalCount) * 100;
        return +percentage.toFixed(2);
      }),
      backgroundColor: backgroundColors[resultType],
    }))

    const chartData = {
      labels: this.unitRatioHeaders.map(header => header.slice(-4)),
      datasets: datasets,
    }

    const chartOptions = {
      responsive: true,
      maintainAspectRatio: false,
      scales: {
        x: {
          stacked: true,
        },
        y: {
          stacked: true,
          max: 100
        },
      },
      plugins: {
        datalabels: {
          color: 'black',
          display: (context: any) => {
            return context.dataset.data[context.dataIndex] > 0;
          },
          formatter: (value: any) => {
            return value.toFixed(2) + '%';
          }
        },
        legend: {
          labels: {
            color: 'black'
          }
        }
      },
    }

    const canvasElement: HTMLCanvasElement = this.unitRatioChartRef.nativeElement;
    this.unitRatioChart = new Chart(canvasElement, {
      type: 'bar',
      data: chartData,
      options: chartOptions
    })

    this.unitRatioTableData = resultTypes.map(resultType => ({
      Category: resultType,
      ...Object.fromEntries(
        Object.keys(this.unitRatioData).map(unit => [
          unit,
          this.unitRatioData[unit][resultType]
        ])
      )
    }))
  }

  createVoltageVsTempProgressChart() {
    const temperatureArray = [];
    for (const temperatureValue in this.voltageTempData) {
      const temperatureCounts = this.voltageTempData[temperatureValue];
      const row = [temperatureValue, temperatureCounts.PASS, temperatureCounts.FAIL, temperatureCounts['NOT-RUN']];
      temperatureArray.push(row);
    }
    this.voltageTempData = temperatureArray;

    if (!this.voltageVsTempChartRef) {
      console.log('voltageVsTempProgressChartRef is not defined');
      return;
    }
    else if (!this.summaryData || !this.voltageResults) {
      console.log('voltageResults is not defined');
      return;
    }

    if (this.voltageVsTempChart) {
      this.voltageVsTempChart.destroy();
    }

    const data = this.summaryData.temperature_results;
    const resultTypes = ['PASS', 'FAIL', 'NOT-RUN'];
    const backgroundColors: { [key: string]: string } = {
      'PASS': 'rgba(75, 192, 192, 0.6)',
      'FAIL': 'rgba(255, 99, 132, 0.6)',
      'NOT-RUN': 'rgba(255, 206, 86, 0.6)',
    }

    const datasets = resultTypes.map(resultType => ({
      label: resultType,
      data: Object.keys(data).map(temperature => {
        const count = data[temperature][resultType];
        const totalCount = resultTypes.reduce((sum, type) => sum + data[temperature][type], 0);
        const percentage = (count / totalCount) * 100;
        return +percentage.toFixed(2);
      }),
      backgroundColor: backgroundColors[resultType],
    }))

    const chartData = {
      labels: Object.keys(data),
      datasets: datasets,
    }

    const chartOptions = {
      responsive: true,
      maintainAspectRatio: false,
      scales: {
        x: {
          stacked: true,
        },
        y: {
          stacked: true,
          max: 100
        },
      },
      plugins: {
        datalabels: {
          color: 'black',
          display: (context: any) => {
            return context.dataset.data[context.dataIndex] > 0;
          },
          formatter: (value: any) => {
            return value.toFixed(2) + '%';
          }
        },
        legend: {
          labels: {
            color: 'black'
          }
        },
      },
    }

    const canvasElement: HTMLCanvasElement = this.voltageVsTempChartRef.nativeElement;
    this.voltageVsTempChart = new Chart(canvasElement, {
      type: 'bar',
      data: chartData,
      options: chartOptions
    })
  }

  createOutcomeVoltageChart() {
    if (!this.outcomeVoltageChartRef) {
      console.log('outcomeVoltageChartRef is not defined');
      return;
    }

    if (this.outcomeVoltageChart) {
      this.outcomeVoltageChart.destroy();
    }

    const labels = Object.keys(this.voltageOutcomeData);
    const data = Object.values(this.voltageOutcomeData).map(subArray => (subArray as any[]).length);
    const canvasElement: HTMLCanvasElement = this.outcomeVoltageChartRef.nativeElement;
    this.outcomeVoltageChart = new Chart(canvasElement, {
      type: 'bar',
      data: {
        labels: labels,
        datasets: [
          {
            label: 'Fail Count',
            data: data,
            backgroundColor: 'rgba(212, 75, 75, 0.5)',
            borderColor: 'rgba(192, 75, 75, 1)',
            borderWidth: 1
          }
        ],
      },
      options: {
        plugins: {
          datalabels: {
            color: 'black',
            display: (context: any) => {
              return context.dataset.data[context.dataIndex] > 0;
            },
          },
          legend: {
            labels: {
              color: 'black'
            }
          },
        },
        scales: {
          y: {
            beginAtZero: true,
            title: {
              display: true,
              text: 'Number of Failures'
            }
          },
          x: {
            title: {
              display: true,
              text: 'Voltage'
            }
          }
        },
        responsive: true,
        maintainAspectRatio: false
      },
    });
    this.createOutcomeVoltagePieChart();
    this.createVoltageRatioChart();
  }

  createOutcomeVoltagePieChart() {
    if (!this.outcomeVoltagePieChartRef) {
      console.log('outcomeVoltagePieChartRef is not defined');
      return;
    }

    if (this.outcomeVoltagePieChart) {
      this.outcomeVoltagePieChart.destroy();
    }

    this.voltageNames = Object.keys(this.voltageOutcomeData);
    this.outcomeVoltageTableData = Object.values(this.voltageOutcomeData).map(subArray => (subArray as any[]).length);
    const canvasElement: HTMLCanvasElement = this.outcomeVoltagePieChartRef.nativeElement;
    const backgroundColors = this.outcomeVoltageTableData.map(() => {
      const opacity = 0.5;
      const redChannel = Math.floor(Math.random() * 100) + 155;
      const randomColor = `rgba(${redChannel}, ${Math.floor(
        Math.random() * 100
      )}, ${Math.floor(Math.random() * 100)}, ${opacity})`;
      return randomColor;
    });

    this.outcomeVoltagePieChart = new Chart(canvasElement, {
      type: 'pie' as ChartType,
      data: {
        labels: this.voltageNames,
        datasets: [
          {
            label: 'Fail Count',
            data: this.outcomeVoltageTableData,
            backgroundColor: backgroundColors,
          },
        ],
      },
      options: {
        plugins: {
          datalabels: {
            color: 'black',
            display: (context: any) => {
              return context.dataset.data[context.dataIndex] > 0;
            },
          },
          legend: {
            labels: {
              color: 'black'
            }
          },
        },
        responsive: true,
        maintainAspectRatio: false
      },
    })

    this.outcomeVoltageTableData = this.voltageNames.map((voltageName, index) => ({
      name: voltageName,
      value: this.outcomeVoltageTableData[index]
    }));
  }

  createVoltageRatioChart() {
    if (!this.voltageRatioChartRef) {
      console.log('voltageRatioChartRef is not defined');
      return;
    }

    if (this.voltageRatioChart) {
      this.voltageRatioChart.destroy();
    }

    this.voltageRatioHeaders = Object.keys(this.voltageRatioData);
    const data = Object.values(this.voltageRatioData).map(subArray => (subArray as any[]).length);
    const resultTypes = ['TOTAL', 'FAIL'];
    const backgroundColors: { [key: string]: string } = {
      TOTAL: 'rgba(75, 192, 192, 0.6)',
      FAIL: 'rgba(192, 75, 75, 0.6)',
    }

    const datasets = resultTypes.map(resultType => ({
      label: resultType,
      data: Object.keys(this.voltageRatioData).map(voltage => {
        const count = this.voltageRatioData[voltage][resultType];
        const totalCount = resultTypes.reduce((sum, type) => sum + this.voltageRatioData[voltage][type], 0);
        const percentage = (count / totalCount) * 100;
        return +percentage.toFixed(2);
      }),
      backgroundColor: backgroundColors[resultType],
    }))

    const chartData = {
      labels: this.voltageRatioHeaders,
      datasets: datasets,
    }

    const chartOptions = {
      responsive: true,
      maintainAspectRatio: false,
      scales: {
        x: {
          stacked: true,
        },
        y: {
          stacked: true,
          max: 100
        },
      },
      plugins: {
        datalabels: {
          color: 'black',
          display: (context: any) => {
            return context.dataset.data[context.dataIndex] > 0;
          },
          formatter: (value: any) => {
            return value.toFixed(2) + '%';
          }
        },
        legend: {
          labels: {
            color: 'black'
          }
        }
      },
    }

    const canvasElement: HTMLCanvasElement = this.voltageRatioChartRef.nativeElement;
    this.voltageRatioChart = new Chart(canvasElement, {
      type: 'bar',
      data: chartData,
      options: chartOptions
    })

    this.voltageRatioTableData = resultTypes.map(resultType => ({
      Category: resultType,
      ...Object.fromEntries(
        Object.keys(this.voltageRatioData).map(voltage => [
          voltage,
          this.voltageRatioData[voltage][resultType]
        ])
      )
    }))
  }

  createOutcomeCornerPieChart() {
    if (!this.cornerPieChartRef) {
      console.log('cornerPieChartRef is not defined');
      return;
    }

    if (this.cornerPieChart) {
      this.cornerPieChart.destroy();
    }

    this.cornerNames = Object.keys(this.cornerOutcomeData);
    this.outcomeCornerTableData = Object.values(this.cornerOutcomeData).map(subArray => (subArray as any[]).length);
    const canvasElement: HTMLCanvasElement = this.cornerPieChartRef.nativeElement;
    const backgroundColors = this.outcomeCornerTableData.map(() => {
      const opacity = 0.5;
      const blueChannel = Math.floor(Math.random() * 100) + 155;
      const randomColor = `rgba(${Math.floor(Math.random() * 100)}, ${Math.floor(
        Math.random() * 100
      )}, ${blueChannel}, ${opacity})`;
      return randomColor;
    });


    this.cornerPieChart = new Chart(canvasElement, {
      type: 'pie' as ChartType,
      data: {
        labels: this.cornerNames,
        datasets: [
          {
            label: 'Fail Count',
            data: this.outcomeCornerTableData,
            backgroundColor: backgroundColors,
          },
        ],
      },
      options: {
        plugins: {
          datalabels: {
            color: 'black',
            display: (context: any) => {
              return context.dataset.data[context.dataIndex] > 0;
            },
          },
          legend: {
            labels: {
              color: 'black'
            }
          },
        },
      },
    })

    this.outcomeCornerTableData = this.cornerNames.map((cornerName, index) => ({
      name: cornerName,
      value: this.outcomeCornerTableData[index]
    }))
  }

  createCornerRatioChart() {
    if (!this.cornerRatioChartRef) {
      console.log('cornerRatioChartRef is not defined');
      return;
    }

    if (this.cornerRatioChart) {
      this.cornerRatioChart.destroy();
    }

    this.cornerRatioHeaders = Object.keys(this.cornerRatioData);
    const data = Object.values(this.cornerRatioData).map(subArray => (subArray as any[]).length);
    const resultTypes = ['TOTAL', 'FAIL'];
    const backgroundColors: { [key: string]: string } = {
      TOTAL: 'rgba(75, 192, 192, 0.6)',
      FAIL: 'rgba(192, 75, 75, 0.6)',
    }

    const datasets = resultTypes.map(resultType => ({
      label: resultType,
      data: Object.keys(this.cornerRatioData).map(corner => {
        const count = this.cornerRatioData[corner][resultType];
        const totalCount = resultTypes.reduce((sum, type) => sum + this.cornerRatioData[corner][type], 0);
        const percentage = (count / totalCount) * 100;
        return +percentage.toFixed(2);
      }),
      backgroundColor: backgroundColors[resultType],
    }))

    const chartData = {
      labels: this.cornerRatioHeaders,
      datasets: datasets,
    }

    const chartOptions = {
      responsive: true,
      maintainAspectRatio: false,
      scales: {
        x: {
          stacked: true,
        },
        y: {
          stacked: true,
          max: 100
        },
      },
      plugins: {
        datalabels: {
          color: 'black',
          display: (context: any) => {
            return context.dataset.data[context.dataIndex] > 0;
          },
          formatter: (value: any) => {
            return value.toFixed(2) + '%';
          }
        },
        legend: {
          labels: {
            color: 'black'
          }
        }
      },
    }

    this.cornerRatioChart = new Chart(this.cornerRatioChartRef.nativeElement, {
      type: 'bar',
      data: chartData,
      options: chartOptions
    })

    this.cornerRatioTableData = resultTypes.map(resultType => ({
      Category: resultType,
      ...Object.fromEntries(
        Object.keys(this.cornerRatioData).map(corner => [
          corner,
          this.cornerRatioData[corner][resultType]
        ])
      )
    }))
  }

  createOutcomeUnitChart() {
    if (!this.outcomeUnitChartRef) {
      console.log('outcomeUnitChartRef is not defined');
      return;
    }

    if (this.outcomeUnitChart) {
      this.outcomeUnitChart.destroy();
    }

    const labels = Object.keys(this.unitOutcomeData);
    const data = Object.values(this.unitOutcomeData).map(subArray => (subArray as any[]).length);
    const canvasElement: HTMLCanvasElement = this.outcomeUnitChartRef.nativeElement;
    this.outcomeUnitChart = new Chart(canvasElement, {
      type: 'bar',
      data: {
        labels: labels.map(label => label.slice(-4)),
        datasets: [
          {
            label: 'Fail Count',
            data: data,
            backgroundColor: 'rgba(212, 212, 75, 0.5)',
            borderColor: 'rgba(212, 212, 75, 1)',
            borderWidth: 1
          },
        ],
      },
      options: {
        plugins: {
          datalabels: {
            color: 'black',
            display: (context: any) => {
              return context.dataset.data[context.dataIndex] > 0;
            },
          },
          legend: {
            labels: {
              color: 'black',
            },
          }
        },
        scales: {
          y: {
            beginAtZero: true,
            title: {
              display: true,
              text: 'Number of Failures'
            }
          },
          x: {
            title: {
              display: true,
              text: 'Unit'
            }
          }
        },
        responsive: true,
        maintainAspectRatio: false
      },
    });
    this.createUnitPieChart();
    this.createUnitRatioChart();
  }

  createOutcomeTempChart() {
    if (!this.outcomeTempChartRef) {
      console.log('outcomeTempChartRef is not defined');
      return;
    }

    if (this.outcomeTempChart) {
      this.outcomeTempChart.destroy();
    }

    const labels = Object.keys(this.tempOutcomeData);
    const data = Object.values(this.tempOutcomeData).map(subArray => (subArray as any[]).length);
    const canvasElement: HTMLCanvasElement = this.outcomeTempChartRef.nativeElement;
    this.outcomeTempChart = new Chart(canvasElement, {
      type: 'bar',
      data: {
        labels: labels,
        datasets: [
          {
            label: 'Fail Count',
            data: data,
            backgroundColor: 'rgba(75, 192, 192, 0.5)',
            borderColor: 'rgba(75, 192, 192, 1)',
            borderWidth: 1
          },
        ],
      },
      options: {
        plugins: {
          datalabels: {
            color: 'black',
            display: (context: any) => {
              return context.dataset.data[context.dataIndex] > 0;
            },
          },
          legend: {
            labels: {
              color: 'black'
            }
          }
        },
        scales: {
          y: {
            beginAtZero: true,
            title: {
              display: true,
              text: 'Number of Failures'
            }
          },
          x: {
            title: {
              display: true,
              text: 'Temperature'
            }
          }
        },
        responsive: true,
        maintainAspectRatio: false
      },
    });
    this.createTempPieChart();
    this.createTempRatioChart();
  }

  createTempRatioChart() {
    if (!this.tempRatioChartRef) {
      console.log('tempRatioChartRef is not defined');
      return;
    }

    if (this.tempRatioChart) {
      this.tempRatioChart.destroy();
    }

    this.tempRatioHeaders = Object.keys(this.tempRatioData);
    const data = Object.values(this.tempRatioData).map(subArray => (subArray as any[]).length);
    const resultTypes = ['TOTAL', 'FAIL'];
    const backgroundColors: { [key: string]: string } = {
      TOTAL: 'rgba(75, 192, 192, 0.6)',
      FAIL: 'rgba(192, 75, 75, 0.6)',
    }

    const datasets = resultTypes.map(resultType => ({
      label: resultType,
      data: Object.keys(this.tempRatioData).map(temp => {
        const count = this.tempRatioData[temp][resultType];
        const totalCount = resultTypes.reduce((sum, type) => sum + this.tempRatioData[temp][type], 0);
        const percentage = (count / totalCount) * 100;
        return +percentage.toFixed(2);
      }),
      backgroundColor: backgroundColors[resultType],
    }))

    const chartData = {
      labels: this.tempRatioHeaders,
      datasets: datasets,
    }

    const chartOptions = {
      responsive: true,
      maintainAspectRatio: false,
      scales: {
        x: {
          stacked: true,
        },
        y: {
          stacked: true,
          max: 100
        },
      },
      plugins: {
        datalabels: {
          color: 'black',
          display: (context: any) => {
            return context.dataset.data[context.dataIndex] > 0;
          },
          formatter: (value: any) => {
            return value.toFixed(2) + '%';
          },
        },
        legend: {
          labels: {
            color: 'black'
          }
        }
      },
    }

    this.tempRatioChart = new Chart(this.tempRatioChartRef.nativeElement, {
      type: 'bar',
      data: chartData,
      options: chartOptions
    })

    this.tempRatioTableData = resultTypes.map(resultType => ({
      Category: resultType,
      ...Object.fromEntries(
        Object.keys(this.tempRatioData).map(temp => [
          temp,
          this.tempRatioData[temp][resultType]
        ])
      )
    }))
  }

  createTempPieChart() {
    if (!this.tempPieChartRef) {
      console.log('tempPieChartRef is not defined');
      return;
    }

    if (this.tempPieChart) {
      this.tempPieChart.destroy();
    }

    this.tempNames = Object.keys(this.tempOutcomeData);
    this.outcomeTempTableData = Object.values(this.tempOutcomeData).map(subArray => (subArray as any[]).length);
    const canvasElement: HTMLCanvasElement = this.tempPieChartRef.nativeElement;
    const backgroundColors = this.outcomeVoltageTableData.map(() => {
      const opacity = 0.5;
      const greenChannel = Math.floor(Math.random() * 100) + 155;
      const randomColor = `rgba(${Math.floor(Math.random() * 100)}, ${greenChannel}, ${Math.floor(Math.random() * 100)}, ${opacity})`;
      return randomColor;
    });

    this.tempPieChart = new Chart(canvasElement, {
      type: 'pie' as ChartType,
      data: {
        labels: this.tempNames,
        datasets: [
          {
            label: 'Fail Count',
            data: this.outcomeTempTableData,
            backgroundColor: backgroundColors,
          },
        ],
      },
      options: {
        plugins: {
          datalabels: {
            color: 'black',
          },
          legend: {
            labels: {
              color: 'black'
            }
          },
        },
        responsive: true,
        maintainAspectRatio: false
      },
    })

    this.outcomeTempTableData = this.tempNames.map((tempName, index) => ({
      name: tempName,
      value: this.outcomeTempTableData[index]
    }))
  }

  createOutcomeCornerChart() {
    if (!this.outcomeCornerChartRef) {
      console.log('outcomeCornerChartRef is not defined');
      return;
    }

    if (this.outcomeCornerChart) {
      this.outcomeCornerChart.destroy();
    }

    const labels = Object.keys(this.cornerOutcomeData);
    const data = Object.values(this.cornerOutcomeData).map(subArray => (subArray as any[]).length);
    const canvasElement: HTMLCanvasElement = this.outcomeCornerChartRef.nativeElement;
    this.outcomeCornerChart = new Chart(canvasElement, {
      type: 'bar',
      data: {
        labels: labels,
        datasets: [
          {
            label: 'Fail Count',
            data: data,
            backgroundColor: 'rgba(75, 75, 192, 0.5)',
            borderColor: 'rgba(75, 75, 192, 1)',
            borderWidth: 1
          },
        ],
      },
      options: {
        plugins: {
          datalabels: {
            color: 'black',
            display: (context: any) => {
              return context.dataset.data[context.dataIndex] > 0;
            },
          },
          legend: {
            labels: {
              color: 'black'
            }
          }
        },
        scales: {
          y: {
            beginAtZero: true,
            title: {
              display: true,
              text: 'Number of Failures'
            }
          },
          x: {
            title: {
              display: true,
              text: 'Corner'
            }
          }
        },
        responsive: true,
        maintainAspectRatio: false
      },
    });
    this.createOutcomeCornerPieChart();
    this.createCornerRatioChart();
  }

  onBack() {
    this.router.navigate(['../'], { relativeTo: this.route });
  }

  navigateToViewData(buildID: string) {
    this.router.navigate(['/project-menu/view-data/view-data-page'], { queryParams: { buildID } });
  }
}
