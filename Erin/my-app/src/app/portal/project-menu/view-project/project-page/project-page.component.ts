import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { PortalService } from 'src/app/portal/portal.service';
import { Chart } from 'chart.js/auto';

interface VoltageData {
  label: string;
  PASSING_RATE: number;
  FAILING_RATE: number;
  NOT_RUN: number;
}

@Component({
  selector: 'app-project-page',
  templateUrl: './project-page.component.html',
  styleUrls: ['./project-page.component.scss']
})
export class ProjectPageComponent implements OnInit {
  @ViewChild('stackedBarChart') stackedBarChartRef!: ElementRef;
  @ViewChild('cornerProgressChart') cornerProgressChartRef!: ElementRef;
  stackedBarChart: Chart | undefined;
  cornerProgressChart: Chart | undefined;
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
  }

  async getProcessedTests(): Promise<void> {
    try {
      this.processedTests = await this.portalService.getProcessedTests(this.projectID);
    } catch (error) {
      console.error('Error fetching processed tests:', error);
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
      console.log("blockPercentages", this.blockPercentages);

      this.blockPercentagesData = Object.keys(this.blockPercentages).map(blockName => ({
        block: blockName,
        ...this.blockPercentages[blockName]
      }));

      console.table(this.blockPercentagesData);
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

    const voltageNames = this.voltageVsBlockData.map((voltageData: { voltage: any; }) => voltageData.voltage);
    const passData = this.voltageVsBlockData.map((voltageData: { PASSING_RATE: any; }) => voltageData.PASSING_RATE ?? 0);
    const failData = this.voltageVsBlockData.map((voltageData: { FAILING_RATE: any; }) => voltageData.FAILING_RATE ?? 0);
    const notRunData = this.voltageVsBlockData.map((voltageData: { NOT_RUN: any; }) => voltageData.NOT_RUN ?? 0);

    const ctx = this.stackedBarChartRef.nativeElement.getContext('2d');

    if (this.stackedBarChart) {
      this.stackedBarChart.destroy();
    }

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
      options: {
        responsive: true,
        scales: {
          x: {
            stacked: true,
          },
          y: {
            stacked: true,
          },
        },
      },
    });
  }


  createCornerProgressChart(): void {
    if (!this.voltageVsCornerData || this.voltageVsCornerData.length === 0) {
      return;
    }

    const cornerNames = this.voltageVsCornerData.map((item) => item.corner);
    const passData = this.voltageVsCornerData.map((item) => item.TOTAL_PASSING_PERCENTAGE ?? 0);
    const failData = this.voltageVsCornerData.map((item) => item.TOTAL_FAILING_PERCENTAGE ?? 0);
    const notRunData = this.voltageVsCornerData.map((item) => item.TOTAL_NOT_RUN_PERCENTAGE ?? 0);

    const ctx = this.cornerProgressChartRef.nativeElement.getContext('2d');

    if (this.cornerProgressChart) {
      this.cornerProgressChart.destroy();
    }

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
      options: {
        responsive: true,
        scales: {
          x: {
            stacked: true,
          },
          y: {
            stacked: true,
          },
        },
      },
    });
  }
}
