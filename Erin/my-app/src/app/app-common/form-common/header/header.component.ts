import { Component, Input, OnInit } from '@angular/core';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss'],
})
export class HeaderComponent implements OnInit {
  _formHeader: string = '';
  _formSubHeader: string = '';

  ngOnInit(): void { }

  @Input()
  set formHeader(formHeader: string) {
    this._formHeader = formHeader;
  }

  get formHeader() {
    return this._formHeader;
  }

  @Input()
  set formSubHeader(formSubHeader: string) {
    this._formSubHeader = formSubHeader;
  }

  get formSubHeader() {
    return this._formSubHeader;
  }
}
