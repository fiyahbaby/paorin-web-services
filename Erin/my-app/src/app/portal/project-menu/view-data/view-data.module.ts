import { NgModule } from '@angular/core';
import { ViewDataRoutingModule } from './view-data-routing.module';
import { ViewDataComponent } from './view-data.component';
import { FormCommonModule } from 'src/app/app-common/form-common/form-common.module';
import { ViewDataPageComponent } from './view-data-page/view-data-page.component';
import { ViewMDataPageComponent } from './view-m-data-page/view-m-data-page.component';
import { DataTabComponent } from './data-tab/data-tab.component';

@NgModule({
  declarations: [ViewDataComponent, ViewDataPageComponent, ViewMDataPageComponent, DataTabComponent],
  imports: [ViewDataRoutingModule, FormCommonModule],
})
export class ViewDataModule { }
