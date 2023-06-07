import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Message, MessageService } from 'primeng/api';
import { PortalService } from '../../portal.service';
import { Router } from '@angular/router';
import { AuthService } from 'src/app/app-common/auth-service/auth.service';
import { CreateProjectResponse } from './create-project-response.interface';

@Component({
  selector: 'app-create-project',
  templateUrl: './create-project.component.html',
  styleUrls: ['./create-project.component.scss'],
})
export class CreateProjectComponent implements OnInit {
  createProjectForm!: FormGroup;
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
      // username: ['', Validators.required],
      // password: ['', Validators.required],
    });
  }
}
