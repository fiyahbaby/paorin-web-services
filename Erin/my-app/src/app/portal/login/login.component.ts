import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Message, MessageService } from 'primeng/api';
import { PortalService } from '../portal.service';
import { Router } from '@angular/router';
import { AuthService } from '../../app-common/auth-service/auth.service';
import { LoginResponse } from './login-response.interface';
import { FormCommonService } from 'src/app/app-common/form-common/form-common.service';

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
    private authService: AuthService,
    private formCommonService: FormCommonService,
  ) { }

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

    if (this.loginForm.invalid) {
      this.formCommonService.validatorFormGroupFields(this.loginForm);
      return;
    }

    this.portalService
      .setAccounts(this.loginForm.value)
      .then((data: LoginResponse) => {
        if (data.type === 'error') {
          this.formCommonService.addErrorMessage(data.message, data.type);
        } else {
          this.authService.setUserType(data.userType);
          this.navigateToHome();
        }
      }).catch((error) => {
        this.formCommonService.addErrorMessage(error.message, error.type);
      });
  }

  private navigateToHome() {
    this.router.navigate(['/home']);
  }
}
