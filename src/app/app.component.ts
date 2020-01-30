import {
  Component,
  OnInit,
  AfterViewChecked,
  ChangeDetectorRef,
  HostListener
} from '@angular/core';
import $ from 'jquery';
import { IntercommunicationService } from 'src/app/services/intercommunication.service';
import { DeviceDetectorService } from 'ngx-device-detector';
import { UnityService } from './home/alldevices/services/UnityService.service';
@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit, AfterViewChecked {
  title = 'ai3twopoint';
  // displayedColumns: string[] = ['position', 'name', 'weight', 'symbol'];
  // dataSource = ELEMENT_DATA;

  @HostListener('window:beforeunload', ['$event']) onBeforeUnload(event) {
    // do something here
    confirm(' beforeunload method called');
  }

  public status = 'online';
  public isConnected = true;
  pageBgStatus: boolean;
  connectionForBG: any;
  isJqueryWorking: string;
  consoleversion: string;
  deviceInfo: any;
  isSettingsDownloadEnable: boolean = true;
  constructor(
    private cdr: ChangeDetectorRef,
    private intercomm: IntercommunicationService,
    private deviceService: DeviceDetectorService,
    private unityService: UnityService
  ) {
    this.pageBgStatus = true;
    this.detectDevice();
    this.clearSomeLogics();//this is related to asset page(threat to asset)

  }

  ngAfterViewChecked() {
    // called after every check of a component’s view(s);
    this.cdr.detectChanges();
    // setInterval(() => {

    // }, 1000);
  }

  ngOnInit() {
    console.log(
      '%cAI%c3 %cMulti Tenant Build on : %cJanuary 24 2020 5:00 PM(V2)',
      'font-weight: bold; color: #000000', 'font-weight: bold; color: #F78F37', 'font-weight: bold; color: #000000', 'font-weight: bold; color: #F78F37'
    );

    this.pageBgStatus = true;

    this.connectionForBG = this.intercomm.getpageBg().subscribe(info => {
      this.pageBgStatus = info;
    });
    //  this.intercomm.setpageBg(true);
  }

  detectDevice() {
    // console.log("user_agent_check", navigator.userAgent);

    this.deviceInfo = this.deviceService.getDeviceInfo();
    // console.log("Device detected", this.deviceInfo);

    // const isMobile = this.deviceService.isMobile();
    // const isTablet = this.deviceService.isTablet();
    // this.unityService.isDesktop = this.deviceService.isDesktop(); // with topology
    this.isSettingsDownloadEnable = this.deviceService.isDesktop();
    this.unityService.isDesktop = false; // without topology
    // console.log("is_mobile", isMobile);
    // console.log("is_tablet", isTablet);
    // console.log("is_desktop", this.unityService.isDesktop);
  }

  clearSomeLogics() {
    localStorage.removeItem('query_with_timstamps');
    localStorage.removeItem('threatChipFromThreats');
  }
}
