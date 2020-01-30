import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { Topology2D } from './topology-2D.component';

describe('Topology2D', () => {
  let component: Topology2D;
  let fixture: ComponentFixture<Topology2D>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ Topology2D ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(Topology2D);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
