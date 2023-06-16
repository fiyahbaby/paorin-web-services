import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { FormBuilder, FormControl, FormGroup, Validators, ReactiveFormsModule, FormsModule } from '@angular/forms';


@Component({
  selector: 'app-add-project-param',
  templateUrl: './add-project-param.component.html',
  styleUrls: ['./add-project-param.component.scss']
})
export class AddProjectParamComponent implements OnInit {
  selectedProject: any;
  addUnitForm!: FormGroup;
  unit: any[] = [];

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private formBuilder: FormBuilder,
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
    this.unit.push({ processCorner: '', barCode: '' });
  }

  onBack(): void {
    this.router.navigate(['../'], { relativeTo: this.route });
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
