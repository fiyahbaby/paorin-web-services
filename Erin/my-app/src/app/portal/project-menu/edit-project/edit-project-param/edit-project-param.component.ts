import { Component, OnInit, ElementRef, Renderer2 } from '@angular/core';
import { FormArray, FormBuilder, FormGroup } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { MessageService } from 'primeng/api';
import { PortalService } from 'src/app/portal/portal.service';

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
  voltages: any[] = [];
  temperatures: any[] = [];
  units: any[] = [];
  projectData: any;
  project: any[] = [];
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
    private portalService: PortalService,
    private elementRef: ElementRef,
    private renderer: Renderer2
  ) { }

  async ngOnInit(): Promise<void> {
    this.route.queryParams.subscribe(params => {
      this.selectedProject = params;
    });
    this.selectedProject = JSON.parse(this.selectedProject.data);
    this.selectedProject.isEditing = false;
    this.projectData = await this.portalService.getProjectData(this.selectedProject.id);

    const initialProject = (await this.portalService.getProjectData(this.selectedProject.id)).project;
    const initialVoltages = this.projectData?.voltages || [];
    const initialTemperatures = this.projectData?.temperatures || [];
    const initialUnits = this.projectData?.units || [];

    this.initialSelectedProject = {
      project: JSON.parse(JSON.stringify(initialProject)),
      voltages: JSON.parse(JSON.stringify(initialVoltages)),
      temperatures: JSON.parse(JSON.stringify(initialTemperatures)),
      units: JSON.parse(JSON.stringify(initialUnits))
    };

    this.voltages = JSON.parse(JSON.stringify(initialVoltages));
    this.temperatures = JSON.parse(JSON.stringify(initialTemperatures));
    this.units = JSON.parse(JSON.stringify(initialUnits));
  }

  toggleEdit(project: any): void {
    project.isEditing = !project.isEditing;
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

  onBack(): void {
    this.router.navigate(['../'], { relativeTo: this.route });
  }

  onSubmit(): void {
    const modifiedVoltages = this.voltages
      .filter(voltage => voltage.isEditing)
      .map(voltage => ({
        id: voltage.id,
        name: voltage.name,
        value: voltage.value
      }));

    const modifiedTemperatures = this.temperatures
      .filter(temperature => temperature.isEditing)
      .map(temperature => ({
        id: temperature.id,
        name: temperature.name,
        value: temperature.value
      }));

    const modifiedUnits = this.units
      .filter(unit => unit.isEditing)
      .map(unit => ({
        id: unit.id,
        processCorner: unit.process_corner,
        barCode: unit.two_d_name,
        deviceDNA: unit.device_dna
      }));

    const isProjectModified = this.selectedProject.isEditing;
    const modifiedProject = this.selectedProject.isEditing ? [this.selectedProject] : [];

    if (
      modifiedVoltages.length === 0 &&
      modifiedTemperatures.length === 0 &&
      modifiedUnits.length === 0 &&
      modifiedProject.length === 0 &&
      !isProjectModified &&
      !this.fileContent
    ) {
      this.messageService.add({
        severity: 'error',
        summary: 'No Modifications',
        detail: 'There are no changes made.',
        life: 3000
      });
      window.scrollTo(0, 0);
      return;
    }

    const modifiedData = {
      voltages: modifiedVoltages,
      temperatures: modifiedTemperatures,
      units: modifiedUnits,
      project: modifiedProject
    };

    this.portalService.updateProjectData(modifiedData).then(response => {
      if (response.success) {
        this.messageService.add({
          severity: 'success',
          summary: 'Success',
          detail: 'Data updated successfully.',
          life: 3000
        });
      } else {
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'Failed to update data.',
          life: 3000
        });
        window.scrollTo(0, 0);
      }
    });

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

      this.portalService.addTestList(JSON.parse(combinedContent)).then(response => {
        console.log(response);
      })
        .catch(error => {
          console.error(error);
          this.messageService.add({
            severity: 'error',
            summary: 'Error',
            detail: 'Failed to add test list.',
            life: 3000
          });
          window.scrollTo(0, 0);
        });
    }

    window.scrollTo(0, 0);
    setTimeout(() => {
      this.router.navigate(['/home']);
    }, 2000);
  }

  onReset(): void {
    this.voltages.forEach((voltage, index) => {
      voltage.name = this.initialSelectedProject.voltages[index]?.name;
      voltage.value = this.initialSelectedProject.voltages[index]?.value;
      voltage.isEditing = false;
    });

    this.temperatures.forEach((temperature, index) => {
      temperature.name = this.initialSelectedProject.temperatures[index]?.name;
      temperature.value = this.initialSelectedProject.temperatures[index]?.value;
      temperature.isEditing = false;
    });

    this.units.forEach((unit, index) => {
      unit.processCorner = this.initialSelectedProject.units[index]?.processCorner;
      unit.barCode = this.initialSelectedProject.units[index]?.barCode;
      unit.isEditing = false;
    });

    if (this.selectedProject) {
      this.selectedProject.project = this.initialSelectedProject.project;
      this.selectedProject.revision = this.initialSelectedProject.revision;
      this.selectedProject.testType = this.initialSelectedProject.testType;
      this.selectedProject.block = this.initialSelectedProject.block;
      this.selectedProject.dateCreated = this.initialSelectedProject.dateCreated;
      this.selectedProject.targetUnitCount = this.initialSelectedProject.targetUnitCount;
      this.selectedProject.isEditing = false;
    }
  }
}
