import { NgModule } from '@angular/core';
import { EditProjectRoutingModule } from './edit-project-routing.module';
import { EditProjectComponent } from './edit-project.component';
import { FormCommonModule } from 'src/app/app-common/form-common/form-common.module';
import { AddProjectParamComponent } from './add-project-param/add-project-param.component';
import { EditProjectParamComponent } from './edit-project-param/edit-project-param.component';

@NgModule({
  declarations: [EditProjectComponent, AddProjectParamComponent, EditProjectParamComponent],
  imports: [EditProjectRoutingModule, FormCommonModule],
})
export class EditProjectModule {}
