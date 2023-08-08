import { NgModule } from '@angular/core';
import { FormCommonModule } from 'src/app/app-common/form-common/form-common.module';
import { ViewMDataPageComponent } from './view-m-data-page.component';
import { ViewMDataRoutingModule } from './view-m-data-routing.module';

@NgModule({
  declarations: [ViewMDataPageComponent],
  imports: [ViewMDataRoutingModule, FormCommonModule],
})
export class ViewDataModule { }
