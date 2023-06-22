import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { PortalService } from 'src/app/portal/portal.service';
import { Message, MessageService, SelectItem } from 'primeng/api';


@Component({
  selector: 'app-confirm-new-project',
  templateUrl: './confirm-new-project.component.html',
  styleUrls: ['./confirm-new-project.component.scss'],
})
export class ConfirmNewProjectComponent implements OnInit {
  newProjectParams: any;
  createProjectParams: any;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private portalService: PortalService,
    private messageService: MessageService,
  ) { }

  ngOnInit(): void {
    this.route.queryParams.subscribe((params) => {
      this.newProjectParams = params;
    });
    this.newProjectParams = JSON.parse(this.newProjectParams.data);
  }

  onBack() {
    const formData = JSON.stringify(this.newProjectParams);
    this.router.navigate(['../'], {
      relativeTo: this.route,
      queryParams: {
        data: formData
      },
    });
  }

  onSubmit() {
    const project_name = this.newProjectParams.existingDeviceField || this.newProjectParams.deviceFamily;
    const revision = this.newProjectParams.existingRevisionField || this.newProjectParams.revision;
    const testType = this.newProjectParams.existingTestTypeField || this.newProjectParams.testType;
    const block = this.newProjectParams.block;

    const projectData = {
      project_name: project_name,
      revision_name: revision,
      test_type_name: testType,
      block_name: block
    };

    this.portalService.submitProjectData(projectData).then((response) => {
      if (!response.success) {
        // There were no modifications made, so show a success message.
        this.messageService.add({
          severity: 'success',
          summary: 'Success',
          detail: 'Project has been successfully created.',
          life: 3000
        });
      } else {
        // There were modifications made, so show an error message.
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'Error creating project.',
          life: 3000
        });
      }
    });
    // this.router.navigate(['/home']);
  }
}
