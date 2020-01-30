import { TestBed, inject } from '@angular/core/testing';

import { MapGL } from './mapgl.service';

describe('MapGL', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [MapGL]
    });
  });

  it('should be created', inject([MapGL], (service: MapGL) => {
    expect(service).toBeTruthy();
  }));
});
