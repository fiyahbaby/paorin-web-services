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
    try {
      const buildData = await this.portalService.getBuildData(JSON.stringify(this.buildID));
      return buildData;
    } catch (error) {
      console.error('An error occurred while fetching build data:', error);
      throw error;
    }
  }

  onSubmit() {
    const buildIds = this.buildID.trim().split(/\s*\n\s*/);

    if (buildIds.length === 1) {
      this.fetchDataForBuild(buildIds[0])
        .then(() => {
          this.messageService.add({
            severity: 'success',
            summary: 'Success',
            detail: 'Build ID exists',
            life: 1000
          });
          setTimeout(() => {
            this.router.navigate(['view-data-page'], {
              relativeTo: this.route,
              queryParams: { buildID: this.buildID },
            });
          }, 1000);
        })
        .catch((error) => {
          console.error('Build ID does not exist', error);
          this.messageService.add({
            severity: 'error',
            summary: 'Error',
            detail: 'Build ID does not exist.',
            life: 2000
          });
          window.scrollTo(0, 0);
        });
    } else if (buildIds.length > 1) {
      const uniqueBuildIds = [...new Set(buildIds)];
      if (uniqueBuildIds.length !== buildIds.length) {
        console.error('Duplicate build IDs found');
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'Duplicate build IDs found.',
          life: 2000
        });
        window.scrollTo(0, 0);
        return;
      }

      Promise.all(buildIds.map(id => this.fetchDataForBuild(id)))
        .then(() => {
          this.messageService.add({
            severity: 'success',
            summary: 'Success',
            detail: 'All Build IDs exist',
            life: 1000
          });
          setTimeout(() => {
            this.router.navigate(['view-m-data-page'], {
              relativeTo: this.route,
              queryParams: { buildIDs: buildIds.join(',') },
            });
          }, 1000);
        })
        .catch((error) => {
          console.error('One or more Build IDs do not exist', error);
          this.messageService.add({
            severity: 'error',
            summary: 'Error',
            detail: 'One or more Build IDs do not exist.',
            life: 2000
          });
          window.scrollTo(0, 0);
        });
    } else {
      console.log("No build ID provided");
    }
  }

  async fetchDataForBuild(buildId: string) {
    try {
      const buildData = await this.portalService.getBuildData(JSON.stringify(buildId));
      return buildData;
    } catch (error) {
      console.error('An error occurred while fetching build data for Build ID:', buildId, error);
      throw error;
    }
  }

  onBack(): void {
    this.router.navigate(['/home']);
  }

  ngOnDestroy() {
    this.subscriptions.forEach((subscription: { unsubscribe: () => any; }) => subscription.unsubscribe());
  }
}
