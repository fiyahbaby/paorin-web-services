import { NgModule } from '@angular/core'; // import Angular core components
import { RouterModule, Routes } from '@angular/router'; // import Router and Routes for defining routes
import { CreateProjectComponent } from './create-project.component';
import { AuthGuard } from 'src/app/app-common/auth-service/auth-guard';

const routes: Routes = [
  {
    path: '',
    component: CreateProjectComponent,
    canActivate: [AuthGuard],
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class CreateProjectRoutingModule {}
