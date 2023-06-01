import { Component, Input, OnInit } from '@angular/core';

@Component({
  selector: 'app-form-label',
  templateUrl: './form-label.component.html',
  styleUrls: ['./form-label.component.scss'],
})
export class FormLabelComponent implements OnInit {
  _formLabel: string = '';
  _mandatory: boolean = false;
  _toolTip: string = '';

  ngOnInit(): void {}

  get hasToolTip() {
    return this._toolTip == null;
  }

  @Input()
  set formLabel(formLabel: string) {
    this._formLabel = formLabel;
  }

  get formLabel() {
    return this._formLabel;
  }

  @Input()
  set tooltipValue(toolTip: string) {
    this._toolTip = toolTip;
  }

  get tooltipValue() {
    return this._toolTip;
  }

  @Input()
  set mandatory(mandatory: any) {
    this._mandatory = mandatory === true || mandatory === 'true';
  }

  get mandatory() {
    return this._mandatory;
  }
}
