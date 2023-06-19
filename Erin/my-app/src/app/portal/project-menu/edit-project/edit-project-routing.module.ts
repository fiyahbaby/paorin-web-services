import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { EditProjectComponent } from './edit-project.component';
import { AuthGuard } from 'src/app/app-common/auth-service/auth-guard';
import { AddProjectParamComponent } from './add-project-param/add-project-param.component';
import { EditProjectParamComponent } from './edit-project-param/edit-project-param.component';

const routes: Routes = [
  {
    path: '',
    component: EditProjectComponent,
    canActivate: [AuthGuard],
  },
  {
    path: 'add-project-param',
    component: AddProjectParamComponent,
    canActivate: [AuthGuard],
  },
  {
    path: 'edit-project-param',
    component: EditProjectParamComponent,
    canActivate: [AuthGuard],
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class EditProjectRoutingModule { }
