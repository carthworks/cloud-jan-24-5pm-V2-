import { TestBed, inject } from '@angular/core/testing';

import { RestserviceService } from './restservice.service';

describe('RestserviceService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [RestserviceService]
    });
  });

  it('should be created', inject([RestserviceService], (service: RestserviceService) => {
    expect(service).toBeTruthy();
  }));
});
