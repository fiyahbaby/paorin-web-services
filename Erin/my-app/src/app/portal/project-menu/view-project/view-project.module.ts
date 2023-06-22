import { NgModule } from '@angular/core';
import { ViewProjectRoutingModule } from './view-project-routing.module';
import { ViewProjectComponent } from './view-project.component';
import { FormCommonModule } from 'src/app/app-common/form-common/form-common.module';
import { ProjectPageComponent } from './project-page/project-page.component';

@NgModule({
  declarations: [ViewProjectComponent, ProjectPageComponent],
  imports: [ViewProjectRoutingModule, FormCommonModule],
})
export class ViewProjectModule { }
