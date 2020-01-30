import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { DeviceonnetChartComponent } from './deviceonnet-chart.component';

describe('DeviceonnetChartComponent', () => {
  let component: DeviceonnetChartComponent;
  let fixture: ComponentFixture<DeviceonnetChartComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ DeviceonnetChartComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DeviceonnetChartComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
