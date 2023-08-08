import { Component, OnInit, AfterViewInit, OnDestroy, ViewChild, ElementRef } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { MessageService, SortEvent } from 'primeng/api';
import { PortalService } from 'src/app/portal/portal.service';
import { ChartModule } from 'primeng/chart';
import { Chart } from 'chart.js/auto';

@Component({
  selector: 'app-view-m-data-page',
  templateUrl: './view-m-data-page.component.html',
  styleUrls: ['./view-m-data-page.component.scss']
})
export class ViewMDataPageComponent implements OnInit {
  buildIDsArray: any;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private portalService: PortalService,
    private messageService: MessageService,
  ) { }

  ngOnInit() {
    this.route.queryParams.subscribe((params) => {
      const buildIDsArray = params['buildIDs'];
      this.buildIDsArray = buildIDsArray.split(',');
    });
  }

  onBack(): void {
    this.router.navigate(['../'], { relativeTo: this.route });
  }

  onSubmit() {

  }
}
