import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { AccordionModule } from 'primeng/accordion';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { CheckboxModule } from 'primeng/checkbox';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { DividerModule } from 'primeng/divider';
import { DropdownModule } from 'primeng/dropdown';
import { ImageModule } from 'primeng/image';
import { InputTextModule } from 'primeng/inputtext';
import { MenubarModule } from 'primeng/menubar';
import { MessagesModule } from 'primeng/messages';
import { MultiSelectModule } from 'primeng/multiselect';
import { RadioButtonModule } from 'primeng/radiobutton';
import { TableModule } from 'primeng/table';
import { TagModule } from 'primeng/tag';
import { TieredMenuModule } from 'primeng/tieredmenu';
import { ToastModule } from 'primeng/toast';
import { TooltipModule } from 'primeng/tooltip';
import { ErrorFieldMessageComponent } from './error-field-message/error-field-message.component';
import { FormLabelComponent } from './form-label/form-label.component';
import { HeaderComponent } from './header/header.component';
import { NavbarComponent } from './navbar/navbar.component';
import { MessageModule } from 'primeng/message';
import { FileUploadModule } from 'primeng/fileupload';
import { TabViewModule } from 'primeng/tabview';


@NgModule({
  declarations: [FormLabelComponent, NavbarComponent, HeaderComponent, ErrorFieldMessageComponent],
  imports: [
    FormsModule,
    ReactiveFormsModule,
    CommonModule,
    InputTextModule,
    CardModule,
    TooltipModule,
    ButtonModule,
    MessagesModule,
    MessageModule,
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
    FileUploadModule,
    TabViewModule
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
    MessageModule,
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
    ErrorFieldMessageComponent,
    FileUploadModule,
    TabViewModule
  ],
  providers: [],
})
export class FormCommonModule { }
