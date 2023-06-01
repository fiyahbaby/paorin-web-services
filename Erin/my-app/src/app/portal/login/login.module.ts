import { NgModule } from '@angular/core';
import { LoginRoutingModule } from './login-routing.module';
import { LoginComponent } from './login.component';
import { FormCommonModule } from 'src/app/app-common/form-common/form-common.module';

@NgModule({
  declarations: [LoginComponent],
  imports: [LoginRoutingModule, FormCommonModule],
})
export class LoginModule {}
