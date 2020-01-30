import { TestBed, inject } from '@angular/core/testing';

import { IntercommunicationService } from './intercommunication.service';

describe('IntercommunicationService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [IntercommunicationService]
    });
  });

  it('should be created', inject([IntercommunicationService], (service: IntercommunicationService) => {
    expect(service).toBeTruthy();
  }));
});
