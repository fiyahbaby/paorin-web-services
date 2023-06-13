import { Injectable } from "@angular/core";
import { FormArray, FormControl, FormGroup } from "@angular/forms";
import { MessageService } from "primeng/api";

@Injectable({
  providedIn: 'root',
})
export class FormCommonService {

  constructor(
    private messageService: MessageService
  ) { }

  validatorFormGroupFields(formGroup: FormGroup) {
    Object.keys(formGroup.controls).forEach(field => {
      const control = formGroup.get(field);
      if (control instanceof FormControl) {
        control.markAsTouched({ onlySelf: true });
      } else if (control instanceof FormGroup) {
        this.validatorFormGroupFields(control);
      } else if (control instanceof FormArray) {
        this.validatorFormArrayFields(control);
      }
    })
  }

  validatorFormArrayFields(formArray: FormArray) {
    Object.keys(formArray.controls).forEach(field => {
      const control = formArray.get(field);
      if (control instanceof FormControl) {
        control.markAsTouched({ onlySelf: true });
      } else if (control instanceof FormGroup) {
        this.validatorFormGroupFields(control);
      } else if (control instanceof FormArray) {
        this.validatorFormArrayFields(control);
      }
    })
  }

  addErrorMessage(message: string, type = 'error') {
    this.messageService.clear();
    this.messageService.add({
      severity: type,
      summary: 'Error',
      detail: message,
    });
  }
}