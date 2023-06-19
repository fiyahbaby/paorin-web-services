import { Component, OnInit } from '@angular/core';
import { FormArray, FormBuilder, FormGroup } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { MessageService } from 'primeng/api';

@Component({
  selector: 'app-edit-project-param',
  templateUrl: './edit-project-param.component.html',
  styleUrls: ['./edit-project-param.component.scss']
})
export class EditProjectParamComponent implements OnInit {
  selectedProject: any;

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
  }

  getVoltageData(): any[] {
    return Object.values(this.selectedProject?.voltages);
  }

  getTempData(): any[] {
    return Object.values(this.selectedProject?.temperature);
  }
}
