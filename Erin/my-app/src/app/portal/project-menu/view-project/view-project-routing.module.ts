import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ViewProjectComponent } from './view-project.component';
import { AuthGuard } from 'src/app/app-common/auth-service/auth-guard';
import { ProjectPageComponent } from './project-page/project-page.component';

const routes: Routes = [
  {
    path: '',
    component: ViewProjectComponent,
    canActivate: [AuthGuard],
  },
  {
    path: 'project-page',
    component: ProjectPageComponent,
    canActivate: [AuthGuard],
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class ViewProjectRoutingModule { }
