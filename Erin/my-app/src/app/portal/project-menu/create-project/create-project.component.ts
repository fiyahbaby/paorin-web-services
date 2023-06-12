import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { Message, MessageService, SelectItem } from 'primeng/api';
import { AuthService } from 'src/app/app-common/auth-service/auth.service';
import { PortalService } from '../../portal.service';

@Component({
  selector: 'app-create-project',
  templateUrl: './create-project.component.html',
  styleUrls: ['./create-project.component.scss'],
})
export class CreateProjectComponent implements OnInit {
  createProjectForm!: FormGroup;
  messages: Message[] = [];
  existingDeviceOptions: SelectItem[] = [];
  existingRevisionOptions: SelectItem[] = [];
  existingBlockOptions: SelectItem[] = [];
  existingTestTypeOptions: SelectItem[] = [];

  constructor(
    private formBuilder: FormBuilder,
    private portalService: PortalService,
    private messageService: MessageService,
    private router: Router,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    this.initFormControl();
    this.initSelectOptions();
  }

  private initFormControl(): void {
    this.createProjectForm = this.formBuilder.group({
      existingDevice: [{ value: false, disabled: false }, Validators.required],
      existingRevision: [
        { value: false, disabled: false },
        Validators.required,
      ],
      existingTestType: [
        { value: false, disabled: false },
        Validators.required,
      ],
      existingBlock: [{ value: false, disabled: false }, Validators.required],
      deviceFamily: [{ value: '', disabled: false }, Validators.required],
      revision: [{ value: '', disabled: false }, Validators.required],
      testType: [{ value: '', disabled: false }, Validators.required],
      block: [{ value: '', disabled: false }, Validators.required],
      existingDeviceField: [{ value: '', disabled: true }, Validators.required],
      existingRevisionField: [
        { value: '', disabled: true },
        Validators.required,
      ],
      existingTestTypeField: [
        { value: '', disabled: true },
        Validators.required,
      ],
      existingBlockField: [{ value: '', disabled: true }, Validators.required],
    });
  }

  private async initSelectOptions() {
    this.existingDeviceOptions = await this.getProject();
    this.existingBlockOptions = await this.getBlock();
    this.existingRevisionOptions = await this.getRevision();
    this.existingTestTypeOptions = await this.getTestType();
  }

  private async getProject() {
    return this.toOptions(await this.portalService.getProjects(), 'project');
  }

  private async getBlock() {
    return this.toOptions(await this.portalService.getProjects(), 'block');
  }

  private async getRevision() {
    return this.toOptions(await this.portalService.getProjects(), 'revision');
  }

  private async getTestType() {
    return this.toOptions(await this.portalService.getProjects(), 'testType');
  }

  private toOptions(options: [], valueField: string): SelectItem[] {
    return !options
      ? []
      : options.map<SelectItem<String>>((value) => {
          return value[valueField];
        });
  }

  onClick(field: string): void {
    switch (field) {
      case 'existingDevice':
        this.setUpField(
          'existingDevice',
          'deviceFamily',
          'existingDeviceField'
        );
        break;
      case 'existingRevision':
        this.setUpField(
          'existingRevision',
          'revision',
          'existingRevisionField'
        );
        break;
      case 'existingTestType':
        this.setUpField(
          'existingTestType',
          'testType',
          'existingTestTypeField'
        );
        break;
      default:
        break;
    }
  }

  private setUpField(
    existingFieldCheckBox: string,
    field: string,
    existingField: string
  ): void {
    const existingFormControl = this.createProjectForm.get(
      existingFieldCheckBox
    );
    const formControl = this.createProjectForm.get(field);
    const existingFieldFormControl = this.createProjectForm.get(existingField);

    if (existingFormControl?.value) {
      formControl?.reset({ value: '', disabled: true });
      existingFieldFormControl?.reset({ value: '', disabled: false });
    } else if (field !== 'block') {
      formControl?.reset({ value: '', disabled: false });
      existingFieldFormControl?.reset({ value: '', disabled: true });
    }
  }

  onBack(): void {
    this.router.navigate(['/home']);
  }

  onReset(): void {
    this.createProjectForm.reset();

    this.setUpField('existingDevice', 'deviceFamily', 'existingDeviceField');
    this.setUpField('existingRevision', 'revision', 'existingRevisionField');
    this.setUpField('existingTestType', 'testType', 'existingTestTypeField');
  }

  onSubmit(): void {
    //TODO: Logic for form submission
  }
}
