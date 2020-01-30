import { TestBed, inject } from '@angular/core/testing';

import { SocketdataService } from './socketdata.service';

describe('SocketdataService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [SocketdataService]
    });
  });

  it('should be created', inject([SocketdataService], (service: SocketdataService) => {
    expect(service).toBeTruthy();
  }));
});
