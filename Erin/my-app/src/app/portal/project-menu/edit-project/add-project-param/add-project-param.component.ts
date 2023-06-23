import { Component, OnInit } from '@angular/core';
import { FormArray, FormBuilder, FormGroup } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { MessageService } from 'primeng/api';
import { PortalService } from 'src/app/portal/portal.service';

@Component({
  selector: 'app-add-project-param',
  templateUrl: './add-project-param.component.html',
  styleUrls: ['./add-project-param.component.scss']
})
export class AddProjectParamComponent implements OnInit {
  selectedProject: any;
  addUnitForm!: FormGroup;
  addVoltageForm!: FormGroup;
  addTempForm!: FormGroup;
  formHasChanges: boolean = false;
  uploadedFileName: string = '';

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private formBuilder: FormBuilder,
    private messageService: MessageService,
    private portalService: PortalService
  ) { }

  ngOnInit(): void {
    this.route.queryParams.subscribe(params => {
      this.selectedProject = params;
    });
    this.selectedProject = JSON.parse(this.selectedProject.data);
    console.log(this.selectedProject);
    this.initializeForm();
    this.addUnitForm.valueChanges.subscribe(() => {
      this.formHasChanges = true;
    });
    this.addVoltageForm.valueChanges.subscribe(() => {
      this.formHasChanges = true;
    });
    this.addTempForm.valueChanges.subscribe(() => {
      this.formHasChanges = true;
    });
  }

  initializeForm(): void {
    this.addUnitForm = this.formBuilder.group({
      units: this.formBuilder.array([])
    });
    this.addUnitRow();

    this.addVoltageForm = this.formBuilder.group({
      voltages: this.formBuilder.array([])
    });
    this.addVoltageRow();

    this.addTempForm = this.formBuilder.group({
      temperatures: this.formBuilder.array([])
    });
    this.addTempRow();
  }

  createUnitFormGroup(index: number): FormGroup {
    return this.formBuilder.group({
      processCorner: '',
      barcode: '',
      index: index
    });
  }

  createVoltageFormGroup(index: number): FormGroup {
    return this.formBuilder.group({
      name: '',
      value: '',
      index: index
    });
  }

  createTempFormGroup(index: number): FormGroup {
    return this.formBuilder.group({
      name: '',
      value: '',
      index: index
    });
  }

  get units(): FormArray {
    return this.addUnitForm.get('units') as FormArray;
  }

  get voltages(): FormArray {
    return this.addVoltageForm.get('voltages') as FormArray;
  }

  get temperatures(): FormArray {
    return this.addTempForm.get('temperatures') as FormArray;
  }

  addUnitRow(): void {
    const units = this.addUnitForm.get('units') as FormArray;
    const unitFormGroup = this.createUnitFormGroup(units.length + 1);
    units.push(unitFormGroup);
  }

  addVoltageRow(): void {
    const voltages = this.addVoltageForm.get('voltages') as FormArray;
    const voltageFormGroup = this.createVoltageFormGroup(voltages.length + 1);
    voltages.push(voltageFormGroup);
  }

  addTempRow(): void {
    const temperatures = this.addTempForm.get('temperatures') as FormArray;
    const temperaturesFormGroup = this.createTempFormGroup(temperatures.length + 1);
    temperatures.push(temperaturesFormGroup);
  }

  handleFileUpload(event: any): void {
    const uploadedFiles = event.files;
    if (uploadedFiles && uploadedFiles.length > 0) {
      this.uploadedFileName = uploadedFiles[0].name;
      console.log(this.uploadedFileName)
    } else {
      this.uploadedFileName = '';
      console.log(this.uploadedFileName)
    }
  }

  onReset(): void {
    const units = this.addUnitForm.get('units') as FormArray;
    units.clear();
    this.addUnitRow();

    const voltages = this.addVoltageForm.get('voltages') as FormArray;
    voltages.clear();
    this.addVoltageRow();

    const temperatures = this.addTempForm.get('temperatures') as FormArray;
    temperatures.clear();
    this.addTempRow();

    this.formHasChanges = false;
    this.uploadedFileName = '';
  }

  onSubmit() {
    if (!this.formHasChanges) {
      return;
    }

    const unitValues = this.addUnitForm.value.units;
    const tempValues = this.addTempForm.value.temperatures;
    const voltageValues = this.addVoltageForm.value.voltages;

    const projectData = {
      project_id: this.selectedProject.id,
      voltages: voltageValues,
      temperatures: tempValues,
      units: unitValues
    };

    console.log(projectData);

    this.portalService.addProjectParam(projectData).then(response => {
      console.log(response);
      // Handle the response from the backend
    })
      .catch(error => {
        console.error(error);
        // Handle the error
      });

    this.formHasChanges = false;
  }

  onBack(): void {
    this.router.navigate(['../'], { relativeTo: this.route });
  }
}
