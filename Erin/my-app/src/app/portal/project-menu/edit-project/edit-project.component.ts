import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { Message, MessageService, SelectItem } from 'primeng/api';
import { AuthService } from 'src/app/app-common/auth-service/auth.service';
import { PortalService } from '../../portal.service';

@Component({
  selector: 'app-edit-project',
  templateUrl: './edit-project.component.html',
  styleUrls: ['./edit-project.component.scss'],
})
export class EditProjectComponent implements OnInit {
  editProjectForm!: FormGroup;
  existingDeviceOptions: SelectItem[] = [];
  existingRevisionOptions: SelectItem[] = [];
  existingBlockOptions: SelectItem[] = [];
  existingTestTypeOptions: SelectItem[] = [];
  projects: any[] = [];
  selectedProject: any = null;
  filter: string = '';

  constructor(
    private formBuilder: FormBuilder,
    private portalService: PortalService,
    private messageService: MessageService,
    private router: Router,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    this.initFormControl();
    this.fetchProjects();
  }

  private initFormControl(): void {
    this.editProjectForm = this.formBuilder.group({
      projectAction: [{ value: '', disabled: false }, Validators.required],
      filter: [{ value: '', disabled: false }],
    });
  }

  private async fetchProjects() {
    try {
      this.projects = await this.portalService.getProjects();
    } catch (error) {
      // Handle error here
    }
  }

  onBack(): void {
    this.router.navigate(['/home']);
  }

  onSubmit(): void {
    const projectAction = this.editProjectForm.get('projectAction')?.value;
    if (projectAction && this.selectedProject) {
      // Handle the submit logic here
    } else {
      this.messageService.add({
        severity: 'error',
        summary: 'Error',
        detail:
          'Required fields are missing. Please fill in all the required information.',
      });
      console.log('Error message added');
      return;
    }
  }
}
