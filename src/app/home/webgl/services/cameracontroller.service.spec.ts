import { TestBed, inject } from '@angular/core/testing';

import { CameracontrollerService } from './cameracontroller.service';

describe('CameracontrollerService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [CameracontrollerService]
    });
  });

  it('should be created', inject([CameracontrollerService], (service: CameracontrollerService) => {
    expect(service).toBeTruthy();
  }));
});
