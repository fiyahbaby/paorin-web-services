import { NgModule } from '@angular/core';
import { FormCommonModule } from 'src/app/app-common/form-common/form-common.module';
import { HomeRoutingModule } from './home-routing.module';
import { HomeComponent } from './home.component';

@NgModule({
  declarations: [HomeComponent],
  imports: [HomeRoutingModule, FormCommonModule],
})
export class HomeModule {}
