import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ViewDataPageComponent } from './view-data-page.component';
import { AuthGuard } from 'src/app/app-common/auth-service/auth-guard';

const routes: Routes = [
  {
    path: '',
    component: ViewDataPageComponent,
    canActivate: [AuthGuard],
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class ViewDataPageRoutingModule { }
