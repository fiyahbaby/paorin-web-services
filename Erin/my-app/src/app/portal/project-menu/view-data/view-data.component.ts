import { Component } from '@angular/core';
import { PortalService } from '../../portal.service';
import { ActivatedRoute, Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { MessageService } from 'primeng/api';

@Component({
  selector: 'app-view-data',
  templateUrl: './view-data.component.html',
  styleUrls: ['./view-data.component.scss']
})
export class ViewDataComponent {
  buildID: string = '';
  private subscriptions: Subscription[] = [];

  constructor(
    private portalService: PortalService,
    private router: Router,
    private route: ActivatedRoute,
    private messageService: MessageService,
  ) { }

  async fetchData() {
    console.log(this.buildID);
    try {
      const buildData = await this.portalService.getBuildData(this.buildID);
      return buildData;
    } catch (error) {
      console.error('An error occurred while fetching build data:', error);
      throw error;
    }
  }

  onSubmit() {
    this.fetchData()
      .then((buildData) => {
        this.messageService.add({
          severity: 'success',
          summary: 'Success',
          detail: 'Build data retrieved successfully',
          life: 3000
        });
        setTimeout(() => {
          this.router.navigate(['view-data-page'], {
            relativeTo: this.route,
            queryParams: { data: JSON.stringify(buildData) },
          });
        }, 2000);
        window.scrollTo(0, 0);
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


  onBack(): void {
    this.router.navigate(['/home']);
  }

  // ngOnDestroy() {
  //   this.subscriptions.forEach((subscription: { unsubscribe: () => any; }) => subscription.unsubscribe());
  // }
}
