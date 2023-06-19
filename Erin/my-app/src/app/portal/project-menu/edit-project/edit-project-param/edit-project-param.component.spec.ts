import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EditProjectParamComponent } from './edit-project-param.component';

describe('EditProjectParamComponent', () => {
  let component: EditProjectParamComponent;
  let fixture: ComponentFixture<EditProjectParamComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ EditProjectParamComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(EditProjectParamComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
