import {AllDeviceRoutingRoutingModule } from "./alldevice-routing.module";


describe('AllDeviceRoutingRoutingModule', () => {
  let allDeviceRoutingModule: AllDeviceRoutingRoutingModule;

  beforeEach(() => {
    allDeviceRoutingModule = new AllDeviceRoutingRoutingModule();
  });

  it('should create an instance', () => {
    expect(allDeviceRoutingModule).toBeTruthy();
  });
});
