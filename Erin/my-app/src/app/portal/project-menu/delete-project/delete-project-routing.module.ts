import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AuthGuard } from 'src/app/app-common/auth-service/auth-guard';
import { DeleteProjectComponent } from './delete-project.component';
import { ConfirmDeleteProjectComponent } from './confirm-delete-project/confirm-delete-project.component';

const routes: Routes = [
  {
    path: '',
    component: DeleteProjectComponent,
    canActivate: [AuthGuard],
  },
  {
    path: 'confirm-delete-project',
    component: ConfirmDeleteProjectComponent,
    canActivate: [AuthGuard],
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class DeleteProjectRoutingModule { }
