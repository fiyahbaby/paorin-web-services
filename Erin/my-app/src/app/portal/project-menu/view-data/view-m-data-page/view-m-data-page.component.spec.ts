import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ViewMDataPageComponent } from './view-m-data-page.component';

describe('ViewMDataPageComponent', () => {
  let component: ViewMDataPageComponent;
  let fixture: ComponentFixture<ViewMDataPageComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ViewMDataPageComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ViewMDataPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
