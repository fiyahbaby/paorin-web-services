import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ViewProjectComponent } from './view-project.component';
import { AuthGuard } from 'src/app/app-common/auth-service/auth-guard';
import { ProjectPageComponent } from './project-page/project-page.component';
import { ItemSummaryComponent } from './project-page/item-summary/item-summary.component';

const routes: Routes = [
  {
    path: '',
    component: ViewProjectComponent,
    canActivate: [AuthGuard],
  },
  {
    path: 'project-page',
    component: ProjectPageComponent,
    canActivate: [AuthGuard],
  },
  {
    path: 'project-page/item-summary',
    component: ItemSummaryComponent,
    canActivate: [AuthGuard],
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class ViewProjectRoutingModule { }
