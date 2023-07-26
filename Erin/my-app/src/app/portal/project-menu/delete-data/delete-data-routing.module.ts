import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { DeleteDataModule } from './delete-data.module';
import { AuthGuard } from 'src/app/app-common/auth-service/auth-guard';
import { DeleteDataComponent } from './delete-data.component';

const routes: Routes = [
  {
    path: '',
    component: DeleteDataComponent,
    canActivate: [AuthGuard],
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class DeleteDataRoutingModule { }
