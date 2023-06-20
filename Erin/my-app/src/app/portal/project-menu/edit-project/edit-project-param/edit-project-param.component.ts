import { Component, OnInit } from '@angular/core';
import { FormArray, FormBuilder, FormGroup } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { MessageService } from 'primeng/api';

@Component({
  selector: 'app-edit-project-param',
  templateUrl: './edit-project-param.component.html',
  styleUrls: ['./edit-project-param.component.scss'],
  providers: [MessageService]
})
export class EditProjectParamComponent implements OnInit {
  selectedProject: any;
  initialSelectedProject: any;
  isFormSubmitted: boolean = false;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private formBuilder: FormBuilder,
    private messageService: MessageService
  ) { }

  ngOnInit(): void {
    this.route.queryParams.subscribe(params => {
      this.selectedProject = params;
    });
    this.selectedProject = JSON.parse(this.selectedProject.data);
    this.selectedProject.isEditing = false;
    this.initialSelectedProject = JSON.parse(JSON.stringify(this.selectedProject));
  }

  getVoltageData(): any[] {
    return Object.values(this.selectedProject?.voltages);
  }

  getTempData(): any[] {
    return Object.values(this.selectedProject?.temperature);
  }

  getUnitData(): any[] {
    return Object.values(this.selectedProject?.units);
  }

  toggleEdit(project: any): void {
    project.isEditing = !project.isEditing;
  }

  onBack(): void {
    this.router.navigate(['../'], { relativeTo: this.route });
  }

  onSubmit(): void {
    // Iterate over the data and filter the modified values
    const modifiedVoltages = this.getVoltageData().filter(voltage => voltage.isEditing);
    const modifiedTemperatures = this.getTempData().filter(temperature => temperature.isEditing);
    const modifiedUnits = this.getUnitData().filter(unit => unit.isEditing);
    const isProjectModified = this.selectedProject.isEditing;

    if (
      modifiedVoltages.length === 0 &&
      modifiedTemperatures.length === 0 &&
      modifiedUnits.length === 0 &&
      !isProjectModified
    ) {
      this.messageService.add({
        severity: 'error',
        summary: 'No Modifications',
        detail: 'There are no changes made.',
        life: 3000
      });
      return;
    }

    console.log('Modified Voltages:', modifiedVoltages);
    console.log('Modified Temperatures:', modifiedTemperatures);
    console.log('Modified Units:', modifiedUnits);
    if (isProjectModified) {
      console.log('Modified Project:', this.selectedProject);
    }

    // Reset the editing flag for all items
    this.getVoltageData().forEach(voltage => voltage.isEditing = false);
    this.getTempData().forEach(temperature => temperature.isEditing = false);
    this.getUnitData().forEach(unit => unit.isEditing = false);
    this.selectedProject.isEditing = false;

    this.messageService.add({
      severity: 'success',
      summary: 'Submission Successful',
      detail: 'Your changes have been saved.',
      life: 3000
    });
    this.isFormSubmitted = true;
  }


  onReset(): void {
    if (this.isFormSubmitted) {
      this.messageService.add({
        severity: 'warn',
        summary: 'Form Submitted',
        detail: 'You cannot reset the form after submission.',
        life: 3000
      });

      return;
    }

    // Reset the data for all param
    this.getVoltageData().forEach(voltage => {
      voltage.name = this.initialSelectedProject.voltages[voltage.id]?.name;
      voltage.value = this.initialSelectedProject.voltages[voltage.id]?.value;
      voltage.isEditing = false;
    });

    this.getTempData().forEach(temperature => {
      temperature.name = this.initialSelectedProject.temperature[temperature.id]?.name;
      temperature.value = this.initialSelectedProject.temperature[temperature.id]?.value;
      temperature.isEditing = false;
    });
    // Reset the unit data
    this.getUnitData().forEach(unit => {
      unit.processCorner = this.initialSelectedProject.units[unit.id]?.processCorner;
      unit.threshold = this.initialSelectedProject.units[unit.id]?.threshold;
      unit.barCode = this.initialSelectedProject.units[unit.id]?.barCode;
      unit.isEditing = false;
    });

    if (this.selectedProject) {
      this.selectedProject.project = this.initialSelectedProject.project;
      this.selectedProject.revision = this.initialSelectedProject.revision;
      this.selectedProject.testType = this.initialSelectedProject.testType;
      this.selectedProject.block = this.initialSelectedProject.block;
      this.selectedProject.dateCreated = this.initialSelectedProject.dateCreated;
      this.selectedProject.isEditing = false;
    }
  }
}
