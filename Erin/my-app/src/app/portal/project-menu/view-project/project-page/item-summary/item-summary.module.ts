import { NgModule } from '@angular/core';
import { FormCommonModule } from 'src/app/app-common/form-common/form-common.module';
import { ItemSummaryComponent } from './item-summary.component';
import { ItemSummaryRoutingModule } from './item-summary-routing.module';

@NgModule({
  declarations: [ItemSummaryComponent],
  imports: [ItemSummaryRoutingModule, FormCommonModule],
})
export class ItemSummaryModule { }
