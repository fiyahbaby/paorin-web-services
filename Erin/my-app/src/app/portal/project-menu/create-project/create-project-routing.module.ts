import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AuthGuard } from 'src/app/app-common/auth-service/auth-guard';
import { ConfirmNewProjectComponent } from './confirm-new-project/confirm-new-project.component';
import { CreateProjectComponent } from './create-project.component';

const routes: Routes = [
  {
    path: '',
    component: CreateProjectComponent,
    canActivate: [AuthGuard],
  },
  {
    path: 'confirm-new-project',
    component: ConfirmNewProjectComponent,
    canActivate: [AuthGuard],
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class CreateProjectRoutingModule { }
