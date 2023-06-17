import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormControl, FormGroup } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { MessageService } from 'primeng/api';


@Component({
  selector: 'app-add-project-param',
  templateUrl: './add-project-param.component.html',
  styleUrls: ['./add-project-param.component.scss']
})
export class AddProjectParamComponent implements OnInit {
  selectedProject: any;
  addUnitForm!: FormGroup;
  units: any[] = [];
  i = 1;

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
    this.addUnitFormControl();
    this.addRow();
  }


  private addUnitFormControl(): void {
    this.addUnitForm = this.formBuilder.group({
      processCorner: [''],
      barCode: ['']
    });
  }

  addRow(): void {
    this.units.push({ index: this.i, processCorner: '', barCode: '' });
    this.i++;
  }

  onBack(): void {
    this.router.navigate(['../'], { relativeTo: this.route });
  }

  onReset(): void {
    this.messageService.clear();
    this.addUnitForm.reset();
    this.units.splice(0);
    this.i = 1;
    this.addRow();
  }


  onSubmit() {
    // TODO
  }

  get processCorner() {
    return this.addUnitForm.get('processCorner') as FormControl;
  }

  get barCode() {
    return this.addUnitForm.get('barCode') as FormControl;
  }

}
