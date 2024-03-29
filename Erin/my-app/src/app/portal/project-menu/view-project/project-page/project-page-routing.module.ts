import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AuthGuard } from 'src/app/app-common/auth-service/auth-guard';
import { ProjectPageComponent } from './project-page.component';
import { ItemSummaryComponent } from './item-summary/item-summary.component';

const routes: Routes = [
  {
    path: '',
    component: ProjectPageComponent,
    canActivate: [AuthGuard],
  },
  {
    path: 'item-summary',
    component: ItemSummaryComponent,
    canActivate: [AuthGuard],
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class ProjectPageRoutingModule { }
