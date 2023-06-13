import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ConfirmNewProjectComponent } from './confirm-new-project.component';
import { AuthGuard } from 'src/app/app-common/auth-service/auth-guard';

const routes: Routes = [
  {
    path: '',
    component: ConfirmNewProjectComponent,
    canActivate: [AuthGuard],
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class ConfirmNewProjectRoutingModule {}
