import { Component, Input } from "@angular/core";
import { FormControl } from "@angular/forms";

@Component({
  selector: 'app-error-field-message',
  template: `
    <div *ngIf="isInvalid()" class="alert alert-danger">
      <p-message *ngIf="formControl.hasError('required')" severity="error" text="Required Field"></p-message>
    </div>
  `,
  styles: [],
})
export class ErrorFieldMessageComponent {

  @Input() formControl!: FormControl;
  @Input() showMessage = true;

  constructor() { }

  isInvalid() {
    if (this.formControl?.disabled) {
      return false;
    }

    return this.formControl?.invalid && (this.formControl.touched || this.formControl.dirty) && this.showMessage;
  }

}