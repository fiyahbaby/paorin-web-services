import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AuthGuard } from 'src/app/app-common/auth-service/auth-guard';
import { ItemSummaryComponent } from './item-summary.component';

const routes: Routes = [
  {
    path: '',
    component: ItemSummaryComponent,
    canActivate: [AuthGuard],
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class ItemSummaryRoutingModule { }
