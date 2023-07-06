import { NgModule } from '@angular/core';
import { ViewDataPageComponent } from './view-data-page.component';
import { FormCommonModule } from 'src/app/app-common/form-common/form-common.module';
import { ViewDataPageRoutingModule } from './view-data-routing.module';

@NgModule({
  declarations: [ViewDataPageComponent],
  imports: [ViewDataPageRoutingModule, FormCommonModule],
})
export class ViewDataPageModule { }
