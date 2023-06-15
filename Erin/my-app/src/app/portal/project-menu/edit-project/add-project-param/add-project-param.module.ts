import { NgModule } from '@angular/core';
import { AddProjectParamRoutingModule } from './add-project-param-routing.module';
import { AddProjectParamComponent } from './add-project-param.component';
import { FormCommonModule } from 'src/app/app-common/form-common/form-common.module';

@NgModule({
  declarations: [AddProjectParamComponent],
  imports: [AddProjectParamRoutingModule, FormCommonModule],
})
export class AddProjectParamModule { }
