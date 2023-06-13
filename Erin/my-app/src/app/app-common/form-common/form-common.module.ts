import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { AccordionModule } from 'primeng/accordion';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { CheckboxModule } from 'primeng/checkbox';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { DividerModule } from 'primeng/divider';
import { ImageModule } from 'primeng/image';
import { MenubarModule } from 'primeng/menubar';
import { MessagesModule } from 'primeng/messages';
import { RadioButtonModule } from 'primeng/radiobutton';
import { TieredMenuModule } from 'primeng/tieredmenu';
import { ToastModule } from 'primeng/toast';
import { TooltipModule } from 'primeng/tooltip';
import { FormLabelComponent } from './form-label/form-label.component';
import { HeaderComponent } from './header/header.component';
import { NavbarComponent } from './navbar/navbar.component';
import { TableModule } from 'primeng/table';
import { MultiSelectModule } from 'primeng/multiselect';
import { DropdownModule } from 'primeng/dropdown';
import { TagModule } from 'primeng/tag';
import { InputTextModule } from 'primeng/inputtext';

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
    ConfirmDialogModule,
    ToastModule,
    TableModule,
    RadioButtonModule,
    MultiSelectModule,
    TagModule,
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
    ConfirmDialogModule,
    ToastModule,
    TableModule,
    RadioButtonModule,
    MultiSelectModule,
    TagModule,
  ],
  providers: [],
})
export class FormCommonModule {}
