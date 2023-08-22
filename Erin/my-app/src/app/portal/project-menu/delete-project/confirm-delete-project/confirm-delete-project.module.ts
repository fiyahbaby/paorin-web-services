import { NgModule } from '@angular/core';
import { FormCommonModule } from 'src/app/app-common/form-common/form-common.module';
import { ConfirmDeleteProjectRoutingModule } from './confirm-delete-project-routing.module';
import { ConfirmDeleteProjectComponent } from './confirm-delete-project.component';

@NgModule({
  declarations: [ConfirmDeleteProjectComponent],
  imports: [ConfirmDeleteProjectRoutingModule, FormCommonModule],
})
export class ConfirmDeleteProjectModule { }
