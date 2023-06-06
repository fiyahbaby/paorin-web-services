import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { AppCommonModule } from '../app-common/app-common.module';
import { FormCommonModule } from '../app-common/form-common/form-common.module';
import { PortalRoutingModule } from './portal-routing.module';
import { PortalComponent } from './portal.component';
import { PortalService } from './portal.service';
import { ProjectMenuComponent } from './project-menu/project-menu.component';
import { CreateProjectComponent } from './project-menu/create-project/create-project.component';
import { ViewProjectComponent } from './project-menu/view-project/view-project.component';
import { EditProjectComponent } from './project-menu/edit-project/edit-project.component';

@NgModule({
  declarations: [PortalComponent, ProjectMenuComponent, CreateProjectComponent, ViewProjectComponent, EditProjectComponent],
  imports: [
    CommonModule,
    PortalRoutingModule,
    FormCommonModule,
    AppCommonModule,
  ],
  providers: [PortalService],
})
export class PortalModule {}
