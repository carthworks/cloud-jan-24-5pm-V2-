import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { VerifyMaskComponent } from './verify-mask.component';

describe('VerifyMaskComponent', () => {
  let component: VerifyMaskComponent;
  let fixture: ComponentFixture<VerifyMaskComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ VerifyMaskComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(VerifyMaskComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
