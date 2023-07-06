import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { MessageService, SortEvent } from 'primeng/api';
import { PortalService } from 'src/app/portal/portal.service';

@Component({
  selector: 'app-view-data-page',
  templateUrl: './view-data-page.component.html',
  styleUrls: ['./view-data-page.component.scss']
})
export class ViewDataPageComponent implements OnInit {
  buildData: any;
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
    "VCC_BATT",
    "VCC_PMC",
    "VCC_PSFP",
    "VCC_PSLP",
    "VCC_RAM",
    "VCC_SOC",
    "VCCAUX",
    "VCCAUX_PMC",
    "VCCAUX_SYSMON",
    "VCCINT",
    "VCCINT",
  ];
  buildDataMap: { [key: string]: any } = {};
  testResultMap: { [key: string]: any } = {};
  refParam: any;
  highestMaxTemp!: number;
  lowestMinTemp!: number;


  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private portalService: PortalService,
    private messageService: MessageService,
  ) { }

  ngOnInit(): void {
    this.route.queryParams.subscribe((params) => {
      this.buildData = params;
    });
    this.buildData = JSON.parse(this.buildData.data);
    this.createBuildDataMap();
    this.createTestResultMap();
    this.sendData();
    this.refParam = this.buildData[0];
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
    console.log(this.testResultMap);
  }



  sendData(): void {
    this.portalService.sendBuildData(this.buildData)
      .then(response => {
        const { "Max. Temp": maxTemp, "Min. Temp": minTemp } = response;
        this.refParam = { ...this.refParam, "Max. Temp": maxTemp, "Min. Temp": minTemp };
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


  onBack(): void {
    this.router.navigate(['/home']);
  }

  onSubmit() {

  }
}
