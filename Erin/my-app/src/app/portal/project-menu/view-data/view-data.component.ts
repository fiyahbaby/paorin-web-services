import { Component } from '@angular/core';
import { PortalService } from '../../portal.service';
import { ActivatedRoute, Router } from '@angular/router';
import { Subscription } from 'rxjs';


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
  ) { }

  async fetchData() {
    console.log(this.buildID);
    try {
      const buildData = await this.portalService.getBuildData(this.buildID);
      console.log(buildData);
    } catch (error) {
      console.error('An error occurred while fetching build data:', error);
      // Handle the error appropriately (e.g., display an error message)
    }
  }

  onSubmit() {
    this.fetchData()
  }

  onBack(): void {
    this.router.navigate(['/home']);
  }

  ngOnDestroy() {
    // Unsubscribe from subscriptions to avoid memory leaks
    this.subscriptions.forEach((subscription: { unsubscribe: () => any; }) => subscription.unsubscribe());
  }
}
