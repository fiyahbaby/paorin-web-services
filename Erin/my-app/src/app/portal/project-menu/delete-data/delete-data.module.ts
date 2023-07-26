import { NgModule } from '@angular/core';
import { DeleteDataRoutingModule } from './delete-data-routing.module';
import { DeleteDataComponent } from './delete-data.component';
import { FormCommonModule } from 'src/app/app-common/form-common/form-common.module';

@NgModule({
  declarations: [DeleteDataComponent],
  imports: [DeleteDataRoutingModule, FormCommonModule],
})
export class DeleteDataModule { }
