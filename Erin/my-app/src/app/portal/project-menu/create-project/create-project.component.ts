import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Message, MessageService } from 'primeng/api';
import { PortalService } from '../../portal.service';
import { Router } from '@angular/router';
import { AuthService } from 'src/app/app-common/auth-service/auth.service';

@Component({
  selector: 'app-create-project',
  templateUrl: './create-project.component.html',
  styleUrls: ['./create-project.component.scss'],
})
export class CreateProjectComponent implements OnInit {
  createProjectForm!: FormGroup;
  checked: boolean = false;
  messages: Message[] = [];

  constructor(
    private formBuilder: FormBuilder,
    private portalService: PortalService,
    private messageService: MessageService,
    private router: Router,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    this.initFormControl();
  }

  private initFormControl(): void {
    this.createProjectForm = this.formBuilder.group({
      existingDevice: [false, Validators.required],
      existingRevision: [false, Validators.required],
      existingTestType: [false, Validators.required],
      existingBlock: [false, Validators.required],
      deviceFamily: ['', Validators.required],
      revision: ['', Validators.required],
      testType: ['', Validators.required],
      block: ['', Validators.required],
    });
  }
}
