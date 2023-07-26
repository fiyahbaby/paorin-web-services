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
      {
        path: 'view-project',
        loadChildren: async () => {
          const { ViewProjectModule } = await import(
            './view-project/view-project.module'
          );
          return ViewProjectModule;
        },
      },
      {
        path: 'delete-project',
        loadChildren: async () => {
          const { DeleteProjectModule } = await import(
            './delete-project/delete-project.module'
          );
          return DeleteProjectModule;
        },
      },
      {
        path: 'view-data',
        loadChildren: async () => {
          const { ViewDataModule } = await import(
            './view-data/view-data.module'
          );
          return ViewDataModule;
        },
      },
      {
        path: 'delete-data',
        loadChildren: async () => {
          const { DeleteDataModule } = await import(
            './delete-data/delete-data.module'
          );
          return DeleteDataModule;
        },
      },
    ],
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class ProjectMenuRoutingModule { }
