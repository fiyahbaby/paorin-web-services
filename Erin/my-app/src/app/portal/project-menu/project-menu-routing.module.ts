import { NgModule } from '@angular/core'; // import Angular core components
import { RouterModule, Routes } from '@angular/router'; // import Router and Routes for defining routes

const routes: Routes = [
  // define an array of route objects
  {
    path: '',
    children: [
      {
        path: 'create-project',
        loadChildren: async () => {
          const { CreateProjectModule } = await import(
            './create-project/create-project.module'
          );
          return CreateProjectModule;
        },
      },
      {
        path: 'edit-project',
        loadChildren: async () => {
          const { EditProjectModule } = await import(
            './edit-project/edit-project.module'
          );
          return EditProjectModule;
        },
      },
    ],
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)], // register the route configuration with the RouterModule using the forChild() method
  exports: [RouterModule], // make the RouterModule available to other modules
})
export class ProjectMenuRoutingModule {} // define the LoginRoutingModule class as a module
