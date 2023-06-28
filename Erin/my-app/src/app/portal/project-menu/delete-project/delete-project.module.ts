import { NgModule } from '@angular/core';
import { DeleteProjectRoutingModule } from './delete-project-routing.module';
import { DeleteProjectComponent } from './delete-project.component';
import { FormCommonModule } from 'src/app/app-common/form-common/form-common.module';
import { ConfirmDeleteProjectComponent } from './confirm-delete-project/confirm-delete-project.component';

@NgModule({
  declarations: [DeleteProjectComponent, ConfirmDeleteProjectComponent],
  imports: [DeleteProjectRoutingModule, FormCommonModule],
})
export class DeleteProjectModule { }
