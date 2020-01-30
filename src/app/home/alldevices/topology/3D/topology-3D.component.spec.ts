import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { Topology3D } from './topology-3D.component';

describe('Topology3D', () => {
  let component: Topology3D;
  let fixture: ComponentFixture<Topology3D>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ Topology3D ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(Topology3D);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
