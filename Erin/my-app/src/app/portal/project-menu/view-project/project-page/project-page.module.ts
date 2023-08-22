import { NgModule } from '@angular/core';
import { ProjectPageRoutingModule } from './project-page-routing.module';
import { ProjectPageComponent } from './project-page.component';
import { FormCommonModule } from 'src/app/app-common/form-common/form-common.module';
import { ItemSummaryComponent } from './item-summary/item-summary.component';

@NgModule({
  declarations: [ProjectPageComponent, ItemSummaryComponent],
  imports: [ProjectPageRoutingModule, FormCommonModule],
})
export class ProjectPageModule { }
