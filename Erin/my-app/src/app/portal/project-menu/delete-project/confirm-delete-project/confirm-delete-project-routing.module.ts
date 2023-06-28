import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AuthGuard } from 'src/app/app-common/auth-service/auth-guard';
import { ConfirmDeleteProjectComponent } from './confirm-delete-project.component';

const routes: Routes = [
  {
    path: '',
    component: ConfirmDeleteProjectComponent,
    canActivate: [AuthGuard],
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class ConfirmDeleteProjectRoutingModule { }
