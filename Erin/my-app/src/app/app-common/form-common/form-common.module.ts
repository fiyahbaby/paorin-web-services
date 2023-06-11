import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { ImageModule } from 'primeng/image';
import { InputTextModule } from 'primeng/inputtext';
import { MenubarModule } from 'primeng/menubar';
import { MessagesModule } from 'primeng/messages';
import { TooltipModule } from 'primeng/tooltip';
import { FormLabelComponent } from './form-label/form-label.component';
import { NavbarComponent } from './navbar/navbar.component';
import { TieredMenuModule } from 'primeng/tieredmenu';
import { CheckboxModule } from 'primeng/checkbox';
import { DividerModule } from 'primeng/divider';
import { AccordionModule } from 'primeng/accordion';
import { DropdownModule } from 'primeng/dropdown';
import { HeaderComponent } from './header/header.component';

@NgModule({
  declarations: [FormLabelComponent, NavbarComponent, HeaderComponent],
  imports: [
    FormsModule,
    ReactiveFormsModule,
    CommonModule,
    InputTextModule,
    CardModule,
    TooltipModule,
    ButtonModule,
    MessagesModule,
    MenubarModule,
    ImageModule,
    TieredMenuModule,
    CheckboxModule,
    DividerModule,
    AccordionModule,
    DropdownModule,
  ],
  exports: [
    FormsModule,
    ReactiveFormsModule,
    CommonModule,
    FormLabelComponent,
    HeaderComponent,
    NavbarComponent,
    InputTextModule,
    CardModule,
    TooltipModule,
    ButtonModule,
    MessagesModule,
    MenubarModule,
    ImageModule,
    TieredMenuModule,
    CheckboxModule,
    DividerModule,
    AccordionModule,
    DropdownModule,
  ],
  providers: [],
})
export class FormCommonModule { }
