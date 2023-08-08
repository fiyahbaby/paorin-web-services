import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ViewDataComponent } from './view-data.component';
import { AuthGuard } from 'src/app/app-common/auth-service/auth-guard';
import { ViewDataPageComponent } from './view-data-page/view-data-page.component';
import { ViewMDataPageComponent } from './view-m-data-page/view-m-data-page.component';

const routes: Routes = [
  {
    path: '',
    component: ViewDataComponent,
    canActivate: [AuthGuard],
  },
  {
    path: 'view-data-page',
    component: ViewDataPageComponent,
    canActivate: [AuthGuard],
  },
  {
    path: 'view-m-data-page',
    component: ViewMDataPageComponent,
    canActivate: [AuthGuard],
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class ViewDataRoutingModule { }
