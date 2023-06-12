import { NgModule } from '@angular/core';
import { EditProjectRoutingModule } from './edit-project-routing.module';
import { EditProjectComponent } from './edit-project.component';
import { FormCommonModule } from 'src/app/app-common/form-common/form-common.module';

@NgModule({
  declarations: [EditProjectComponent],
  imports: [EditProjectRoutingModule, FormCommonModule],
})
export class EditProjectModule {}
