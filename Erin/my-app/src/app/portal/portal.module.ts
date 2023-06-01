import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { AppCommonModule } from '../app-common/app-common.module';
import { FormCommonModule } from '../app-common/form-common/form-common.module';
import { PortalRoutingModule } from './portal-routing.module';
import { PortalComponent } from './portal.component';
import { PortalService } from './portal.service';

@NgModule({
  declarations: [PortalComponent],
  imports: [
    CommonModule,
    PortalRoutingModule,
    FormCommonModule,
    AppCommonModule,
  ],
  providers: [PortalService],
})
export class PortalModule {}
