import { NgModule } from '@angular/core';
import { CreateProjectRoutingModule } from './create-project-routing.module';
import { CreateProjectComponent } from './create-project.component';
import { FormCommonModule } from 'src/app/app-common/form-common/form-common.module';

@NgModule({
  declarations: [CreateProjectComponent],
  imports: [CreateProjectRoutingModule, FormCommonModule],
})
export class CreateProjectModule {}
