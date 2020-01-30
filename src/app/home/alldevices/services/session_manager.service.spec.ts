import { TestBed } from '@angular/core/testing';

import { SessionManagerService } from './session_manager.service';

describe('SessionManagerService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: SessionManagerService = TestBed.get(SessionManagerService);
    expect(service).toBeTruthy();
  });
});
