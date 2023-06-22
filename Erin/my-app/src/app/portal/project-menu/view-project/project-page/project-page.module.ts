import { NgModule } from '@angular/core';
import { ProjectPageRoutingModule } from './project-page-routing.module';
import { ProjectPageComponent } from './project-page.component';
import { FormCommonModule } from 'src/app/app-common/form-common/form-common.module';

@NgModule({
  declarations: [ProjectPageComponent],
  imports: [ProjectPageRoutingModule, FormCommonModule],
})
export class ProjectPageModule { }
