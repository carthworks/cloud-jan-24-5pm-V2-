import { TestBed, inject } from '@angular/core/testing';

import { ConnectionHandler } from './connectionHandler.service';

describe('ConnectionHandler', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [ConnectionHandler]
    });
  });

  it('should be created', inject([ConnectionHandler], (service: ConnectionHandler) => {
    expect(service).toBeTruthy();
  }));
});
