import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ConfirmNewProjectComponent } from './confirm-new-project.component';

describe('ConfirmNewProjectComponent', () => {
  let component: ConfirmNewProjectComponent;
  let fixture: ComponentFixture<ConfirmNewProjectComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ConfirmNewProjectComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ConfirmNewProjectComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
