import { Component, OnInit } from '@angular/core';
import { FormArray, FormBuilder, FormGroup } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { MessageService } from 'primeng/api';
import { PortalService } from 'src/app/portal/portal.service';
// import * as Papa from 'papaparse';

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
  fileContent: string | undefined;
  isFileContentExists: boolean = false;
  csvData: string[][] = [];
  isLoading: boolean = false;

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
      deviceDNA: '',
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

  handleFileUpload(files: File[]): void {
    if (files && files.length > 0) {
      this.isLoading = true;
      const file = files[0];
      this.uploadedFileName = files[0].name;
      const reader = new FileReader();
      reader.onload = (e) => {
        this.fileContent = reader.result as string;
        if (this.fileContent) {
        }
      };
      reader.readAsText(file);
      setTimeout(() => {
        this.isLoading = false;
      }, 1000);
      this.isFileContentExists = true;
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
    this.fileContent = undefined;
  }


  onSubmit() {
    if (!this.formHasChanges && !this.fileContent) {
      this.messageService.add({
        severity: 'error',
        summary: 'No Modifications',
        detail: 'There are no changes made and no file selected.',
        life: 3000
      });
      window.scrollTo(0, 0);
      return;
    }

    const errorMessages: string[] = [];
    if (this.formHasChanges) {
      const unitValues = this.addUnitForm.value.units;
      const tempValues = this.addTempForm.value.temperatures;
      const voltageValues = this.addVoltageForm.value.voltages;
      const projectData = {
        project_id: this.selectedProject.id,
        voltages: voltageValues,
        temperatures: tempValues,
        units: unitValues
      };

      this.portalService.addProjectParam(projectData).then(response => { })
        .catch(error => {
          console.error(error);
          errorMessages.push('Error adding project parameters. Please try again.');
        });
    }

    if (this.fileContent) {
      const existingData = this.fileContent
        .trim()
        .split('\n')
        .map(line => line.trim())
        .filter(line => line !== '')
        .map(line => line.split(/\s*,\s*/))
        .map(([dc, voltage, temperature, ssuite, suite, Testname]) => ({ dc, voltage, temperature, ssuite, suite, Testname }));

      const combinedData = [...existingData, this.selectedProject];
      const combinedContent = JSON.stringify(combinedData, null, 2);

      this.fileContent = combinedContent;
      console.log(JSON.parse(combinedContent));

      this.portalService.addTestList(JSON.parse(combinedContent)).then(response => {
        console.log(response);
      })
        .catch(error => {
          console.error(error);
          errorMessages.push('Error adding test list. Please try again.');
        });
    }

    this.formHasChanges = false;
    this.fileContent = undefined;
    this.uploadedFileName = '';

    if (errorMessages.length > 0) {
      this.messageService.add({
        severity: 'error',
        summary: 'Error',
        detail: errorMessages.join(' '),
        life: 5000
      });
    } else {
      this.messageService.add({
        severity: 'success',
        summary: 'Success',
        detail: 'Parameters added successfully.',
        life: 2000
      });
    }
    window.scrollTo(0, 0);

    setTimeout(() => {
      this.router.navigate(['/home']);
    }, 2000);
  }


  onBack(): void {
    this.router.navigate(['../'], { relativeTo: this.route });
  }
}
