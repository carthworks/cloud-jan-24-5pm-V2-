import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AnomplycountComponent } from './anomplycount.component';

describe('AnomplycountComponent', () => {
  let component: AnomplycountComponent;
  let fixture: ComponentFixture<AnomplycountComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AnomplycountComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AnomplycountComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
