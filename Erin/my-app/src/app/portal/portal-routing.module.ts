import { HomeModule } from './home/home.module';
import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

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
    ],
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class PortalRoutingModule {}
