import { NgModule } from '@angular/core';
import { ConfirmNewProjectRoutingModule } from './confirm-new-project-routing.module';
import { ConfirmNewProjectComponent } from './confirm-new-project.component';
import { FormCommonModule } from 'src/app/app-common/form-common/form-common.module';

@NgModule({
  declarations: [ConfirmNewProjectComponent],
  imports: [ConfirmNewProjectRoutingModule, FormCommonModule],
})
export class ConfirmNewProjectModule {}
