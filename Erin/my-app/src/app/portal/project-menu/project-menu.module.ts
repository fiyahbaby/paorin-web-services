import { NgModule } from '@angular/core';
import { FormCommonModule } from 'src/app/app-common/form-common/form-common.module';
import { ProjectMenuRoutingModule } from './project-menu-routing.module';
import { ProjectMenuComponent } from './project-menu.component';

@NgModule({
  declarations: [ProjectMenuComponent],
  imports: [ProjectMenuRoutingModule, FormCommonModule],
})
export class ProjectMenuModule { }