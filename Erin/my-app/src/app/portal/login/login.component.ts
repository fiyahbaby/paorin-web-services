import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Message, MessageService } from 'primeng/api';
import { PortalService } from '../portal.service';
import { Router } from '@angular/router';
import { AuthService } from '../../app-common/auth-service/auth.service';
import { LoginResponse } from './login-response.interface';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss'],
})
export class LoginComponent implements OnInit {
  loginForm!: FormGroup;
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
    this.loginForm = this.formBuilder.group({
      username: ['', Validators.required],
      password: ['', Validators.required],
    });
  }

  onSubmit() {
    this.messageService.clear();

    const { username, password } = this.loginForm.controls;

    if (this.loginForm.invalid) {
      username.markAsDirty();
      username.markAsTouched();
      password.markAsDirty();
      password.markAsTouched();
      return;
    }

    this.portalService
      .setAccounts(this.loginForm.value)
      .subscribe((data: LoginResponse) => {
        if (data.type === 'error') {
          this.messageService.add({
            severity: data.type,
            summary: 'Error',
            detail: data.message,
          });
        } else {
          this.authService.setUserType(data.userType);
          this.navigateToHome();
        }
      });
  }

  private navigateToHome() {
    this.router.navigate(['/home']);
  }
}
