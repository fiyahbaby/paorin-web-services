import { HomeModule } from './home/home.module';
import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { CreateProjectModule } from './project-menu/create-project/create-project.module';

const routes: Routes = [
  {
    path: '',
    children: [
      {
        path: '',
        loadChildren: async () => {
          const { LoginModule } = await import('./login/login.module');
          return LoginModule;
        },
      },
      {
        path: 'home',
        loadChildren: async () => {
          const { HomeModule } = await import('./home/home.module');
          return HomeModule;
        },
      },
      {
        path: 'create-project',
        loadChildren: async () => {
          const { CreateProjectModule } = await import(
            './project-menu/create-project/create-project.module'
          );
          return CreateProjectModule;
        },
      },
    ],
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class PortalRoutingModule {}
