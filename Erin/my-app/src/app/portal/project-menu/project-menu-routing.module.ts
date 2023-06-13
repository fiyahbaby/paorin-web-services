import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

const routes: Routes = [
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
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class ProjectMenuRoutingModule {}
