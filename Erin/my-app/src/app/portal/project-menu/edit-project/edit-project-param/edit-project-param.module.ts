import { NgModule } from '@angular/core';
import { EditProjectRoutingModule } from '../edit-project-routing.module';
import { EditProjectParamComponent } from './edit-project-param.component';
import { FormCommonModule } from 'src/app/app-common/form-common/form-common.module';

@NgModule({
  declarations: [EditProjectParamComponent],
  imports: [EditProjectRoutingModule, FormCommonModule],
})
export class EditProjectParamModule { }
