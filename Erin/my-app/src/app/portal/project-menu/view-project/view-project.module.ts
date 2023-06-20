import { NgModule } from '@angular/core';
import { ViewProjectRoutingModule } from './view-project-routing.module';
import { ViewProjectComponent } from './view-project.component';
import { FormCommonModule } from 'src/app/app-common/form-common/form-common.module';

@NgModule({
  declarations: [ViewProjectComponent],
  imports: [ViewProjectRoutingModule, FormCommonModule],
})
export class ViewProjectModule { }
