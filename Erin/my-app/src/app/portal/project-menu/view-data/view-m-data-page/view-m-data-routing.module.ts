import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AuthGuard } from 'src/app/app-common/auth-service/auth-guard';
import { ViewMDataPageComponent } from './view-m-data-page.component';

const routes: Routes = [
  {
    path: '',
    component: ViewMDataPageComponent,
    canActivate: [AuthGuard],
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class ViewMDataRoutingModule { }
