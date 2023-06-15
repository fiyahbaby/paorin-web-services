import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AddProjectParamComponent } from './add-project-param.component';

describe('AddProjectParamComponent', () => {
  let component: AddProjectParamComponent;
  let fixture: ComponentFixture<AddProjectParamComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AddProjectParamComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AddProjectParamComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
