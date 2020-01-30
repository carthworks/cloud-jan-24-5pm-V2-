import { TestBed, inject } from '@angular/core/testing';

import { TextureIDMap } from './TextureIDMap.service';

describe('TextureIDMap', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [TextureIDMap]
    });
  });

  it('should be created', inject([TextureIDMap], (service: TextureIDMap) => {
    expect(service).toBeTruthy();
  }));
});
