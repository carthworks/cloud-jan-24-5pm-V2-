import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { EnlargedLivestreamingChartComponent } from './enlarged-livestreaming-chart.component';

describe('EnlargedLivestreamingChartComponent', () => {
  let component: EnlargedLivestreamingChartComponent;
  let fixture: ComponentFixture<EnlargedLivestreamingChartComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [EnlargedLivestreamingChartComponent]
    })
      .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(EnlargedLivestreamingChartComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
