import { TestBed, inject } from '@angular/core/testing';

import { UnityAppRegistry } from './UnityAppRegistry.service';

describe('AppRegistry', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [UnityAppRegistry]
    });
  });

  it('should be created', inject([UnityAppRegistry], (service: UnityAppRegistry) => {
    expect(service).toBeTruthy();
  }));
});
