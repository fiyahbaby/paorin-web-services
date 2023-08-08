import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { PortalService } from '../../portal.service';
import { ActivatedRoute, Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { MessageService } from 'primeng/api';

@Component({
  selector: 'app-delete-data',
  templateUrl: './delete-data.component.html',
  styleUrls: ['./delete-data.component.scss']
})
export class DeleteDataComponent {
  buildID: string = '';
  buildData: any;
  buildDetails: any;
  testInstances: any;
  testID: any;
  project: any;
  voltage: any;
  temp: any;
  unit: any;

  constructor(
    private portalService: PortalService,
    private router: Router,
    private route: ActivatedRoute,
    private messageService: MessageService,
    private changeDetectorRef: ChangeDetectorRef
  ) { }

  onBack(): void {
    this.router.navigate(['/home']);
  }

  async onSubmit(): Promise<void> {
    try {
      await this.portalService.deleteTestData(this.testID);
      this.messageService.add({ severity: 'success', summary: 'Success', detail: 'Data deleted successfully', life: 3000 });
      window.scrollTo(0, 0);
      setTimeout(() => { this.router.navigate(['/home']); }, 3000);
    } catch (error) {
      console.error('Error deleting data:', error);
      this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Failed to delete data', life: 3000 });
      window.scrollTo(0, 0);
    }
  }

  async onSearch(): Promise<void> {
    try {
      this.buildData = await this.portalService.searchBuildID(this.buildID);
      this.project = [this.buildData.build_id_data.project];
      this.voltage = [this.buildData.build_id_data.voltage];
      this.temp = [this.buildData.build_id_data.temperature];
      this.testInstances = [this.buildData.test_instances];
      this.testID = this.buildData.test_instances[0].test_id;
      this.messageService.add({ severity: 'info', summary: 'Info', detail: 'Build data retrieved successfully. Please confirm decision before deleting.', life: 3000 });
    } catch (error) {
      console.error('Error searching build data:', error);
      this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Failed to retrieve build data', life: 3000 });
    }
  }
}
