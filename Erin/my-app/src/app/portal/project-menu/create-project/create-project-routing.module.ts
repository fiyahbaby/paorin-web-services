import { NgModule } from '@angular/core'; // import Angular core components
import { RouterModule, Routes } from '@angular/router'; // import Router and Routes for defining routes
import { CreateProjectComponent } from './create-project.component';
import { AuthGuard } from 'src/app/app-common/auth-service/auth-guard';

const routes: Routes = [
  // define an array of route objects
  {
    path: '', // define the root path
    component: CreateProjectComponent, // map the root path to LoginComponent
    canActivate: [AuthGuard]
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)], // register the route configuration with the RouterModule using the forChild() method
  exports: [RouterModule], // make the RouterModule available to other modules
})
export class CreateProjectRoutingModule { } // define the LoginRoutingModule class as a module
