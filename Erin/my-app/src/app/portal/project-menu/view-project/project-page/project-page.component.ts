import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { PortalService } from 'src/app/portal/portal.service';
import { Chart, ChartData, ChartDataset, ChartOptions, ChartType } from 'chart.js/auto';
import 'chartjs-plugin-datalabels';
import ChartDataLabels from 'chartjs-plugin-datalabels';
Chart.register(ChartDataLabels);

@Component({
  selector: 'app-project-page',
  templateUrl: './project-page.component.html',
  styleUrls: ['./project-page.component.scss']
})
export class ProjectPageComponent implements OnInit {
  @ViewChild('stackedBarChart') stackedBarChartRef!: ElementRef;
  @ViewChild('cornerProgressChart') cornerProgressChartRef!: ElementRef;
  @ViewChild('projectPieChart') projectPieChartRef!: ElementRef;
  @ViewChild('overallProjectPieChart') overallProjectPieChartRef!: ElementRef;
  @ViewChild('unitStatsChartData') unitProgressChartRef!: ElementRef;
  stackedBarChart: Chart | undefined;
  cornerProgressChart: Chart | undefined;
  projectPieChart: Chart | undefined;
  overallProjectPieChart: Chart | undefined;
  unitStatsChartData: Chart | undefined;
  unitStatsChartOptions: any;
  selectedProject: any;
  projectID: any;
  processedTests: any[] | undefined;
  blockPercentages: any;
  blockPercentagesData: any[] = [];
  voltageVsBlockData: any;
  voltageVsCornerData: any[] | undefined;
  voltages: any[] = [];
  temperatures: any[] = [];
  units: any[] = [];
  voltageNames: string[] = [];
  cornerNames: string[] = [];
  projectStats: any;
  projectPercentages: any;
  unitStats: any;
  isVoltageSummaryPassEnabled: boolean = true;
  isVoltageSummaryFailEnabled: boolean = true;
  isVoltageSummaryNotRunEnabled: boolean = true;
  isProjectSummaryPassEnabled: boolean = true;
  isProjectSummaryFailEnabled: boolean = true;
  isProjectSummaryNotRunEnabled: boolean = true;
  isOverallProjectSummaryPassEnabled: boolean = true;
  isOverallProjectSummaryFailEnabled: boolean = true;
  isOverallProjectSummaryNotRunEnabled: boolean = true;
  isUnitSummaryPassEnabled: boolean = true;
  isUnitSummaryFailEnabled: boolean = true;
  isUnitSummaryNotRunEnabled: boolean = true;
  isCornerSummaryPassEnabled: boolean = true;
  isCornerSummaryFailEnabled: boolean = true;
  isCornerSummaryNotRunEnabled: boolean = true;
  testDuration: any;
  testDurationStats: any;
  testDurationList: any[] = [];

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
    this.getProjectStats();
    this.getUnitStats();
    this.voltages = projectData?.voltages || [];
    this.temperatures = projectData?.temperatures || [];
    this.units = projectData?.units || [];

    this.getProcessedTests();
    this.voltageNames = this.getVoltageNames();
  }

  async ngAfterViewInit(): Promise<void> {
    await this.getVoltageVsBlockData();
    await this.getBlockPercentages();
    this.voltageVsBlockChart();
    await this.getVoltageVsCornerData();
    this.createCornerProgressChart();
    this.createOverallChart();
    this.createProjectChart();
    this.createUnitStatsChart();
    this.getTestDuration();
  }

  async getProcessedTests(): Promise<void> {
    try {
      this.processedTests = await this.portalService.getProcessedTests(this.projectID);
    } catch (error) {
      console.error('Error fetching processed tests:', error);
    }
  }

  async getProjectStats(): Promise<void> {
    try {
      this.projectStats = await this.portalService.getProjectStats(this.projectID);
    } catch (response) {
      console.error('Error fetching project stats:', response);
    }
  }

  async getUnitStats(): Promise<void> {
    try {
      this.unitStats = await this.portalService.getUnitStats(this.projectID);
    } catch (response) {
      console.error('Error fetching project stats:', response);
    }
  }

  async getVoltageVsBlockData(): Promise<void> {
    try {
      this.voltageVsBlockData = await this.portalService.getVoltageVsBlockData(this.projectID);
      const voltageVsBlockDataArray = Object.keys(this.voltageVsBlockData).map(key => ({
        voltage: key,
        PASSING_RATE: this.voltageVsBlockData[key].PASSING_RATE ?? 0,
        FAILING_RATE: this.voltageVsBlockData[key].FAILING_RATE ?? 0,
        NOT_RUN: this.voltageVsBlockData[key].NOT_RUN ?? 0,
      }));
      this.voltageVsBlockData = voltageVsBlockDataArray;
    } catch (error) {
      console.error('Error fetching voltage vs block data:', error);
    }
  }

  async getBlockPercentages(): Promise<void> {
    try {
      this.blockPercentages = await this.portalService.getBlockPercentages(this.projectID);

      this.blockPercentagesData = Object.keys(this.blockPercentages).map(blockName => ({
        block: blockName,
        ...this.blockPercentages[blockName]
      }));
    } catch (error) {
      console.error('Error fetching voltage vs block data:', error);
    }
  }

  getBlockLabel(blockType: string): string {
    switch (blockType) {
      case 'passing_data':
        return 'PASS';
      case 'failing_data':
        return 'FAIL';
      case 'not_run_data':
        return 'NOT-RUN';
      default:
        return '';
    }
  }

  async getVoltageVsCornerData(): Promise<void> {
    try {
      const voltageVsCornerData = await this.portalService.getVoltageVsCornerData(this.projectID);
      if (voltageVsCornerData) {
        this.voltageVsCornerData = this.organizeVoltageVsCornerData(voltageVsCornerData);
      } else {
        this.voltageVsCornerData = [];
      }
    } catch (error) {
      console.error('Error fetching voltage vs corner data:', error);
    }
  }

  getVoltageNames(): string[] {
    return this.voltages.map((voltage: any) => voltage.name);
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

  organizeVoltageVsCornerData(data: { [key: string]: any }): any[] {
    if (!data) {
      return [];
    }

    this.cornerNames = Object.keys(data);
    const dataArray = [];

    for (const cornerName of this.cornerNames) {
      const cornerData = data[cornerName];
      const rowData: any = {
        corner: cornerName,
      };

      for (const voltageName of this.voltageNames) {
        const voltageData = cornerData[voltageName];
        rowData[voltageName] = voltageData?.PASSING_RATE || 0;
      }

      // Add total passing, failing, and not-run percentages per corner
      rowData["TOTAL_PASSING_PERCENTAGE"] = cornerData["TOTAL_PASSING_PERCENTAGE"] || 0;
      rowData["TOTAL_FAILING_PERCENTAGE"] = cornerData["TOTAL_FAILING_PERCENTAGE"] || 0;
      rowData["TOTAL_NOT_RUN_PERCENTAGE"] = cornerData["TOTAL_NOT_RUN_PERCENTAGE"] || 0;

      dataArray.push(rowData);
    }
    return dataArray;
  }

  calculateOverallPercentage(rowData: any): number {
    const passingPercentage = rowData.TOTAL_PASSING_PERCENTAGE || 0;
    return passingPercentage;
  }

  voltageVsBlockChart(): void {
    if (!this.voltageVsBlockData) {
      return;
    }
    const voltageNames = this.voltageNames;
    const data = voltageNames.map((voltageName: string) => {
      const voltageData = this.voltageVsBlockData.find((data: { voltage: string; }) => data.voltage === voltageName);

      if (voltageData) {
        const totalValue = (
          (this.isVoltageSummaryPassEnabled ? voltageData.PASSING_RATE : 0) +
          (this.isVoltageSummaryFailEnabled ? voltageData.FAILING_RATE : 0) +
          (this.isVoltageSummaryNotRunEnabled ? voltageData.NOT_RUN : 0)
        );
        return {
          pass: this.isVoltageSummaryPassEnabled ? parseFloat(((voltageData.PASSING_RATE / totalValue) * 100).toFixed(2)) : 0,
          fail: this.isVoltageSummaryFailEnabled ? parseFloat(((voltageData.FAILING_RATE / totalValue) * 100).toFixed(2)) : 0,
          notRun: this.isVoltageSummaryNotRunEnabled ? parseFloat(((voltageData.NOT_RUN / totalValue) * 100).toFixed(2)) : 0,
        };
      } else {
        return {
          pass: 0,
          fail: 0,
          notRun: 0,
        };
      }
    });

    const passData = voltageNames.map(voltageName => {
      const index = this.voltageNames.indexOf(voltageName);
      if (index !== -1) {
        return isNaN(data[index]?.pass) ? 0 : data[index].pass;
      }
      return 0;
    });

    const failData = voltageNames.map(voltageName => {
      const index = this.voltageNames.indexOf(voltageName);
      if (index !== -1) {
        return isNaN(data[index]?.fail) ? 0 : data[index].fail;
      }
      return 0;
    });

    const notRunData = voltageNames.map(voltageName => {
      const index = this.voltageNames.indexOf(voltageName);
      if (index !== -1) {
        return isNaN(data[index]?.notRun) ? 0 : data[index].notRun;
      }
      return 0;
    });

    if (this.stackedBarChart) {
      this.stackedBarChart.destroy();
    }

    const chartOptions: ChartOptions<'bar'> = {
      onClick: (event, chartElements) => {
        const clickedIndex = chartElements[0].index;
        const clickedVoltage = voltageNames[clickedIndex];
        const params = {
          projectID: this.projectID,
          summaryItem: clickedVoltage,
          category: 'voltage'
        }
        console.log(params);
        this.router.navigate(['item-summary'], {
          relativeTo: this.route,
          queryParams:
          {
            data: JSON.stringify(params),
          }
        });
      },
      responsive: true,
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
          display: (context) => {
            const value = context.dataset.data[context.dataIndex];
            return value !== 0;
          },
          offset: 0,
          anchor: 'center',
          align: 'end',
          labels: {
            value: {
              color: 'black',
              formatter: (value, context) => {
                const datasetIndex = context.datasetIndex;
                if (datasetIndex === 0 && !this.isVoltageSummaryPassEnabled) {
                  return '';
                }
                if (datasetIndex === 1 && !this.isVoltageSummaryFailEnabled) {
                  return '';
                }
                if (datasetIndex === 2 && !this.isVoltageSummaryNotRunEnabled) {
                  return '';
                }
                return value + '%';
              },

            },
          },
        },
      },
      interaction: {
        intersect: false,
      },
    };

    const legendOptions: ChartOptions<'bar'>['plugins'] = {
      legend: {
        onClick: (event, legendItem) => {
          const datasetIndex = legendItem.datasetIndex;
          if (datasetIndex === 0) {
            this.isVoltageSummaryPassEnabled = !this.isVoltageSummaryPassEnabled;
          } else if (datasetIndex === 1) {
            this.isVoltageSummaryFailEnabled = !this.isVoltageSummaryFailEnabled;
          } else if (datasetIndex === 2) {
            this.isVoltageSummaryNotRunEnabled = !this.isVoltageSummaryNotRunEnabled;
          }
          this.voltageVsBlockChart();
        },
      },
    };

    const options: ChartOptions<'bar'> = {
      ...chartOptions,
      plugins: {
        ...chartOptions.plugins,
        ...legendOptions,
      },
    };

    const ctx = this.stackedBarChartRef.nativeElement.getContext('2d');
    this.stackedBarChart = new Chart(ctx, {
      type: 'bar',
      data: {
        labels: voltageNames,
        datasets: [
          {
            label: 'PASS',
            data: passData,
            backgroundColor: 'rgba(75, 192, 192, 0.6)',
          },
          {
            label: 'FAIL',
            data: failData,
            backgroundColor: 'rgba(255, 99, 132, 0.6)',
          },
          {
            label: 'NOT-RUN',
            data: notRunData,
            backgroundColor: 'rgba(255, 206, 86, 0.6)',
          },
        ],
      },
      options: options,
    });

  }

  createCornerProgressChart(): void {
    if (!this.voltageVsCornerData || this.voltageVsCornerData.length === 0) {
      return;
    }

    const cornerNames = this.voltageVsCornerData.map((item) => item.corner);
    const unitStats = this.voltageVsCornerData.map((item) => {
      const totalValue = (
        (this.isCornerSummaryPassEnabled ? parseFloat(item.TOTAL_PASSING_PERCENTAGE ?? '0') : 0) +
        (this.isCornerSummaryFailEnabled ? parseFloat(item.TOTAL_FAILING_PERCENTAGE ?? '0') : 0) +
        (this.isCornerSummaryNotRunEnabled ? parseFloat(item.TOTAL_NOT_RUN_PERCENTAGE ?? '0') : 0)
      );

      return {
        corner: item.corner,
        pass: this.isCornerSummaryPassEnabled ? parseFloat(((parseFloat(item.TOTAL_PASSING_PERCENTAGE ?? '0') / totalValue) * 100).toFixed(2)) : 0,
        fail: this.isCornerSummaryFailEnabled ? parseFloat(((parseFloat(item.TOTAL_FAILING_PERCENTAGE ?? '0') / totalValue) * 100).toFixed(2)) : 0,
        notRun: this.isCornerSummaryNotRunEnabled ? parseFloat(((parseFloat(item.TOTAL_NOT_RUN_PERCENTAGE ?? '0') / totalValue) * 100).toFixed(2)) : 0,
      };
    });

    const passData = unitStats.map((item) => {
      return isNaN(item.pass) ? 0 : item.pass;
    });

    const failData = unitStats.map((item) => {
      return isNaN(item.fail) ? 0 : item.fail;
    });

    const notRunData = unitStats.map((item) => {
      return isNaN(item.notRun) ? 0 : item.notRun;
    });

    if (this.cornerProgressChart) {
      this.cornerProgressChart.destroy();
    }

    const ctx = this.cornerProgressChartRef.nativeElement.getContext('2d');
    const legendOptions: ChartOptions<'bar'>['plugins'] = {
      legend: {
        onClick: (event, legendItem) => {
          const datasetIndex = legendItem.datasetIndex;
          if (datasetIndex === 0) {
            this.isCornerSummaryPassEnabled = !this.isCornerSummaryPassEnabled;
          } else if (datasetIndex === 1) {
            this.isCornerSummaryFailEnabled = !this.isCornerSummaryFailEnabled;
          } else if (datasetIndex === 2) {
            this.isCornerSummaryNotRunEnabled = !this.isCornerSummaryNotRunEnabled;
          }
          this.createCornerProgressChart();
        },
      },
    };

    const chartOptions: ChartOptions<'bar'> = {
      onClick: (event, chartElements) => {
        const clickedIndex = chartElements[0].index;
        const clickedCorner = cornerNames[clickedIndex];
        const params = {
          projectID: this.projectID,
          summaryItem: clickedCorner,
          category: 'corner'
        }
        this.router.navigate(['item-summary'], {
          relativeTo: this.route,
          queryParams:
          {
            data: JSON.stringify(params),
          }
        });
      },
      responsive: true,
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
          display: (context) => {
            const value = context.dataset.data[context.dataIndex];
            return value !== 0;
          },
          offset: 0,
          anchor: 'center',
          align: 'end',
          labels: {
            value: {
              color: 'black',
              formatter: (value, context) => {
                const datasetIndex = context.datasetIndex;
                if (datasetIndex === 0 && !this.isCornerSummaryPassEnabled) {
                  return '';
                }
                if (datasetIndex === 1 && !this.isCornerSummaryFailEnabled) {
                  return '';
                }
                if (datasetIndex === 2 && !this.isCornerSummaryNotRunEnabled) {
                  return '';
                }
                return value + '%';
              },
            },
          },
        },
      },
      interaction: {
        intersect: false,
      },
    };

    const options: ChartOptions<'bar'> = {
      ...chartOptions,
      plugins: {
        ...chartOptions.plugins,
        ...legendOptions,
      },
    };

    this.cornerProgressChart = new Chart(ctx, {
      type: 'bar',
      data: {
        labels: cornerNames,
        datasets: [
          {
            label: 'PASS',
            data: passData,
            backgroundColor: 'rgba(75, 192, 192, 0.6)',
          },
          {
            label: 'FAIL',
            data: failData,
            backgroundColor: 'rgba(255, 99, 132, 0.6)',
          },
          {
            label: 'NOT-RUN',
            data: notRunData,
            backgroundColor: 'rgba(255, 206, 86, 0.6)',
          },
        ],
      },
      options: options
    });
  }

  createOverallChart(): void {
    if (!this.projectStats) {
      return;
    }

    const projectData = this.projectStats;
    const totalValue =
      (this.isOverallProjectSummaryPassEnabled ? projectData.overall_project_progress : 0) +
      (this.isOverallProjectSummaryFailEnabled ? projectData.overall_project_fail_rate : 0) +
      (this.isOverallProjectSummaryNotRunEnabled ? projectData.overall_project_not_run_rate : 0);

    const passData = this.isOverallProjectSummaryPassEnabled ? parseFloat(((projectData.overall_project_progress / totalValue) * 100).toFixed(2)) : 0;
    const failData = this.isOverallProjectSummaryFailEnabled ? parseFloat(((projectData.overall_project_fail_rate / totalValue) * 100).toFixed(2)) : 0;
    const notRunData = this.isOverallProjectSummaryNotRunEnabled ? parseFloat(((projectData.overall_project_not_run_rate / totalValue) * 100).toFixed(2)) : 0;
    const pieChartCtx = this.overallProjectPieChartRef.nativeElement.getContext('2d');

    if (this.overallProjectPieChart) {
      this.overallProjectPieChart.destroy();
    }

    const labels = ['PASS', 'FAIL', 'NOT-RUN'];
    this.overallProjectPieChart = new Chart(pieChartCtx, {
      type: 'pie' as ChartType,
      data: {
        labels: labels,
        datasets: [{
          data: [passData, failData, notRunData],
          backgroundColor: ['rgba(75, 192, 192, 0.6)', 'rgba(255, 99, 132, 0.6)', 'rgba(255, 206, 86, 0.6)'],
        }],
      },
      options: {
        onClick: (event, chartElements) => {
          const clickedIndex = chartElements[0].index;
          const clickedCategory = labels[clickedIndex];
          const params = {
            projectID: this.projectID,
            summaryItem: clickedCategory,
            category: 'project-result'
          }
          if (clickedCategory === 'FAIL') {
            this.router.navigate(['item-summary'], {
              relativeTo: this.route,
              queryParams:
              {
                data: JSON.stringify(params),
              }
            });
          }
        },
        responsive: true,
        plugins: {
          datalabels: {
            color: 'black',
            display: (context) => {
              const value = context.dataset.data[context.dataIndex];
              return value !== 0;
            },
            formatter: (value: any) => {
              return value + '%';
            },
          },
          legend: {
            onClick: (event, legendItem) => {
              const datasetIndex = legendItem.index;
              if (datasetIndex === 0) {
                this.isOverallProjectSummaryPassEnabled = !this.isOverallProjectSummaryPassEnabled;
              } else if (datasetIndex === 1) {
                this.isOverallProjectSummaryFailEnabled = !this.isOverallProjectSummaryFailEnabled;
              } else if (datasetIndex === 2) {
                this.isOverallProjectSummaryNotRunEnabled = !this.isOverallProjectSummaryNotRunEnabled;
              }
              this.createOverallChart();
            },
          },
          tooltip: {
            callbacks: {
              label: (context) => {
                const datasetIndex = context.datasetIndex;
                const value = context.formattedValue;
                if (datasetIndex === 0 && !this.isOverallProjectSummaryPassEnabled) {
                  return '';
                }
                if (datasetIndex === 1 && !this.isOverallProjectSummaryFailEnabled) {
                  return '';
                }
                if (datasetIndex === 2 && !this.isOverallProjectSummaryNotRunEnabled) {
                  return '';
                }
                return value + '%';
              },
            },
          },
        },
      },
    });
  }

  createProjectChart(): void {
    if (!this.projectStats) {
      return;
    }

    const projectData = this.projectStats;
    const totalValue =
      (this.isProjectSummaryPassEnabled ? projectData.project_progress : 0) +
      (this.isProjectSummaryFailEnabled ? projectData.project_fail_rate : 0) +
      (this.isProjectSummaryNotRunEnabled ? projectData.project_not_run_rate : 0);

    const passData = this.isProjectSummaryPassEnabled ? parseFloat(((projectData.project_progress / totalValue) * 100).toFixed(2)) : 0;
    const failData = this.isProjectSummaryFailEnabled ? parseFloat(((projectData.project_fail_rate / totalValue) * 100).toFixed(2)) : 0;
    const notRunData = this.isProjectSummaryNotRunEnabled ? parseFloat(((projectData.project_not_run_rate / totalValue) * 100).toFixed(2)) : 0;
    const pieChartCtx = this.projectPieChartRef.nativeElement.getContext('2d');

    if (this.projectPieChart) {
      this.projectPieChart.destroy();
    }

    const labels = ['PASS', 'FAIL', 'NOT-RUN'];
    this.projectPieChart = new Chart(pieChartCtx, {
      type: 'pie' as ChartType,
      data: {
        labels: labels,
        datasets: [{
          data: [passData, failData, notRunData],
          backgroundColor: ['rgba(75, 192, 192, 0.6)', 'rgba(255, 99, 132, 0.6)', 'rgba(255, 206, 86, 0.6)'],
        }],
      },
      options: {
        onClick: (event, chartElements) => {
          const clickedIndex = chartElements[0].index;
          const clickedCategory = labels[clickedIndex];
          const params = {
            projectID: this.projectID,
            summaryItem: clickedCategory,
            category: 'project-result'
          }
          if (clickedCategory === 'FAIL') {
            this.router.navigate(['item-summary'], {
              relativeTo: this.route,
              queryParams:
              {
                data: JSON.stringify(params),
              }
            });
          }
        },
        responsive: true,
        plugins: {
          datalabels: {
            color: 'black',
            display: (context) => {
              const value = context.dataset.data[context.dataIndex];
              return value !== 0;
            },
            formatter: (value: any) => {
              return value + '%';
            }
          },
          legend: {
            onClick: (event, legendItem) => {
              const datasetIndex = legendItem.index;
              if (datasetIndex === 0) {
                this.isProjectSummaryPassEnabled = !this.isProjectSummaryPassEnabled;
              } else if (datasetIndex === 1) {
                this.isProjectSummaryFailEnabled = !this.isProjectSummaryFailEnabled;
              } else if (datasetIndex === 2) {
                this.isProjectSummaryNotRunEnabled = !this.isProjectSummaryNotRunEnabled;
              }
              this.createProjectChart();
            },
          },
          tooltip: {
            callbacks: {
              label: (context) => {
                const datasetIndex = context.datasetIndex;
                const value = context.formattedValue;
                if (datasetIndex === 0 && !this.isProjectSummaryPassEnabled) {
                  return '';
                }
                if (datasetIndex === 1 && !this.isProjectSummaryFailEnabled) {
                  return '';
                }
                if (datasetIndex === 2 && !this.isProjectSummaryNotRunEnabled) {
                  return '';
                }
                return value + '%';
              },
            },
          },
        },
      },
    });
  }

  prepareUnitStatsChartData(unitStats: any[]): ChartData<'bar'> {
    const labels: string[] = [];
    const datasets: ChartDataset<'bar'>[] = [
      { label: 'PASS', data: [], backgroundColor: 'rgba(75, 192, 192, 0.6)' },
      { label: 'FAIL', data: [], backgroundColor: 'rgba(255, 99, 132, 0.6)' },
      { label: 'NOT-RUN', data: [], backgroundColor: 'rgba(255, 206, 86, 0.6)' },
    ];

    for (const unit of unitStats) {
      const truncatedUnitName = unit.two_d_name.substring(unit.two_d_name.length - 4);
      labels.push(`${truncatedUnitName} - ${unit.process_corner}`);
      const totalValue =
        (this.isUnitSummaryPassEnabled ? unit.data.pass_rate : 0) +
        (this.isUnitSummaryFailEnabled ? unit.data.fail_rate : 0) +
        (this.isUnitSummaryNotRunEnabled ? unit.data.not_run_rate : 0);
      datasets[0].data.push(this.isUnitSummaryPassEnabled && totalValue !== 0 ? parseFloat(((unit.data.pass_rate / totalValue) * 100).toFixed(2)) : 0);
      datasets[1].data.push(this.isUnitSummaryFailEnabled && totalValue !== 0 ? parseFloat(((unit.data.fail_rate / totalValue) * 100).toFixed(2)) : 0);
      datasets[2].data.push(this.isUnitSummaryNotRunEnabled && totalValue !== 0 ? parseFloat(((unit.data.not_run_rate / totalValue) * 100).toFixed(2)) : 0);

    }

    return {
      labels: labels,
      datasets: datasets,
    };
  }

  createUnitStatsChart(): void {
    if (!this.unitStats) {
      return;
    }

    const unitStatsChartData = this.prepareUnitStatsChartData(this.unitStats);

    if (this.unitStatsChartData) {
      this.unitStatsChartData.destroy();
    }

    const chartOptions: ChartOptions<'bar'> = {
      responsive: true,
      plugins: {
        legend: {
          position: 'top',
        },
        datalabels: {
          display: (context) => {
            const value = context.dataset.data[context.dataIndex];
            return value !== 0;
          },
          anchor: 'center',
          align: 'end',
          labels: {
            value: {
              color: 'black',
              formatter: (value, context) => {
                const datasetIndex = context.datasetIndex;
                if (datasetIndex === 0 && !this.isUnitSummaryPassEnabled) {
                  return '';
                }
                if (datasetIndex === 1 && !this.isUnitSummaryFailEnabled) {
                  return '';
                }
                if (datasetIndex === 2 && !this.isUnitSummaryNotRunEnabled) {
                  return '';
                }
                return value + '%';
              },
            },
          },
        },
      },
      scales: {
        x: {
          stacked: true,
        },
        y: {
          stacked: true,
          max: 100
        },
      },
    };

    const legendOptions: ChartOptions<'bar'>['plugins'] = {
      legend: {
        onClick: (event, legendItem) => {
          const datasetIndex = legendItem.datasetIndex;
          if (datasetIndex === 0) {
            this.isUnitSummaryPassEnabled = !this.isUnitSummaryPassEnabled;
          } else if (datasetIndex === 1) {
            this.isUnitSummaryFailEnabled = !this.isUnitSummaryFailEnabled;
          } else if (datasetIndex === 2) {
            this.isUnitSummaryNotRunEnabled = !this.isUnitSummaryNotRunEnabled;
          }
          this.createUnitStatsChart();
        },
      },
    };

    const options: ChartOptions<'bar'> = {
      ...chartOptions,
      plugins: {
        ...chartOptions.plugins,
        ...legendOptions,
      },
    };

    const unitStatsChartCtx = this.unitProgressChartRef.nativeElement.getContext('2d');
    this.unitStatsChartData = new Chart(unitStatsChartCtx, {
      type: 'bar',
      data: unitStatsChartData,
      options: options,
    });
  }

  async getTestDuration() {
    this.testDuration = await this.portalService.getTestDuration(this.projectID);
    this.testDurationList = this.testDuration.passing_test_durations;
    const total = this.isNumber(this.testDuration?.total_run_time) ? this.testDuration.total_run_time : '-';
    const testCount = this.isNumber(this.testDurationList.length) ? this.testDurationList.length : '-';
    const longest = this.isNumber(Math.max(...this.testDurationList)) ? Math.max(...this.testDurationList) : '-';
    const shortest = this.isNumber(Math.min(...this.testDurationList)) ? Math.min(...this.testDurationList) : '-';
    const sum = this.testDurationList.reduce((acc, value) => acc + value, 0);
    const average = sum / this.testDurationList.length;
    const average_rounded = this.isNumber(average) ? Math.round(average) : '-';

    this.testDurationStats = {
      total: total,
      average: average_rounded,
      longest: longest,
      shortest: shortest,
      testCount: testCount
    };
  }

  isNumber(value: any): boolean {
    return typeof value === 'number' && !isNaN(value) && isFinite(value);
  }

}
