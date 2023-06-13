import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { CreateProjectComponent } from './create-project.component';
import { AuthGuard } from 'src/app/app-common/auth-service/auth-guard';

const routes: Routes = [
  {
    path: '',
    component: CreateProjectComponent,
    canActivate: [AuthGuard],
    children: [
      {
        path: 'confirm-new-project',
        loadChildren: async () => {
          const { ConfirmNewProjectRoutingModule } = await import(
            './confirm-new-project/confirm-new-project-routing.module'
          );
          return ConfirmNewProjectRoutingModule;
        },
      },
    ],
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class CreateProjectRoutingModule {}
