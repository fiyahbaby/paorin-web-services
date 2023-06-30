import { NgModule } from '@angular/core';
import { ViewDataRoutingModule } from './view-data-routing.module';
import { ViewDataComponent } from './view-data.component';
import { FormCommonModule } from 'src/app/app-common/form-common/form-common.module';

@NgModule({
  declarations: [ViewDataComponent],
  imports: [ViewDataRoutingModule, FormCommonModule],
})
export class ViewDataModule { }
