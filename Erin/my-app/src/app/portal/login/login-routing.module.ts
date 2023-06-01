import { NgModule } from '@angular/core';   // import Angular core components
import { RouterModule, Routes } from '@angular/router';   // import Router and Routes for defining routes
import { LoginComponent } from './login.component';   // import LoginComponent for routing

const routes: Routes = [   // define an array of route objects
  {
    path: '',   // define the root path
    component: LoginComponent,   // map the root path to LoginComponent
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],   // register the route configuration with the RouterModule using the forChild() method
  exports: [RouterModule],   // make the RouterModule available to other modules
})
export class LoginRoutingModule {}   // define the LoginRoutingModule class as a module
