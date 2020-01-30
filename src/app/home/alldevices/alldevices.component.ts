import {
  Component,
  OnInit,
  HostListener,
  OnDestroy,
  ViewChild,
  Renderer,
  ElementRef
} from '@angular/core';
import { IntercommunicationService } from 'src/app/services/intercommunication.service';
import { SocketdataService } from 'src/app/services/socketdata.service';
import { NgxSpinnerService } from 'ngx-spinner';
import { PlatformLocation } from '@angular/common';
import { Event as NavigationEvent, Router, NavigationStart, ActivatedRoute } from '@angular/router';
import { UnityService } from './services/UnityService.service';
import { UnityAppRegistry } from './services/UnityAppRegistry.service';
import { UnityAppModel } from '../models/UnityAppModel';
import { Subscription } from 'rxjs';
import { SessionManagerService } from './services/session_manager.service';
import { ToastrService } from 'ngx-toastr';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MapGL } from '../webgl/services/mapgl.service';
import { MustMatch } from 'src/app/_helpers/must-match.validator';
import { ConnectionHandler } from 'src/app/services/connectionHandler.service';

@Component({
  selector: 'app-alldevices',
  templateUrl: './alldevices.component.html',
  styleUrls: ['./alldevices.component.css']
})
export class AlldevicesComponent implements OnInit, OnDestroy {
  @ViewChild('calendarDatePickerModal') calendarDatePickerModal;

  selectedCustomer: any;
  private unityAppInstance: UnityAppModel;
  private topologyLiveEvent: Subscription = null;
  private graphViewEvent: Subscription = null;
  private connection: Subscription = null;
  private devTimeLineEvent: Subscription = null;
  private dropDownEvent: Subscription = null;
  private timeStampSplit: any[];
  private lastUpdateTimestamp: any;
  private totalDevices: any;
  private onlineDevices: any;
  private tempOnlineDevices: any;
  private tempTotalDevices: any;
  private deviceInfo: any;
  private subnetInfo: any;
  private customer_id: number;
  public isUnityLodaded: boolean = false;

  Checking_customer_id: boolean = false;
  array: any;
  model: any = {};
  display = false;
  submitted = false;
  updatepasswordForm: FormGroup;

  RowClickedStateInAlldevice: Subscription = null;
  goto_login_popup: boolean = false;
  displayModelFullPage = false;
  currentDeviceType;
  isLive: boolean = false;
  navigationClickEvent: Subscription = null;

  // Date
  public FromDateValue: Date;
  public ToDateValue: Date;
  // Time
  public FromTimeValue: Date;
  public ToTimeValue: Date;

  public minDateValue: Date;
  public maxDateValue: Date;

  public resetStartDate = new Date();
  public resetEndDate = new Date();

  public timeValue: string;

  public sliderStartSeverTime: string;
  public sliderStopSeverTime: string;

  private connectionHandlerCallback: Subscription;

  public startTime;
  public endTime;
  loginUserId: string;

  @HostListener('document:AutoUpdateState', ['$event'])
  onLiveStateChange(param) {
    if (param) {
      this.isLive = true;
    } else {
      this.isLive = false;
    }
  }

  @HostListener('window:popstate', ['$event'])
  onPopState(event) {
    if (localStorage.getItem('crowd_sourcing_popup') == 'onShow') {
      this.displayModelFullPage = false;
    }
  }

  @HostListener('document:FetchCalender', ['$event'])
  onCalender(param) {
    // Calender Click Event
    //console.log('Claender open');

    //  this.calendarDatePickerModal.getNativeElement().click();
    let el: HTMLElement = document.getElementById('calendarDate') as HTMLElement;
    // console.log(el);
    el.click();
  }

  @HostListener('document:Refresh', ['$event'])
  onRefresh(param) {
    this.Refresh();
  }
  @HostListener('document:TopologyUpdate', ['$event'])
  onTopologyUpdate(param) {
    this.computeDeviceHistory(param.detail.value);
  }

  @HostListener('document:DevTimeLine', ['$event'])
  onRequestDevTimeLine(param) {
    this.spinner.show();
    var req = {
      startTime: +param.detail.startTime,
      endTime: +param.detail.endTime
    };
    if (this.Checking_customer_id) {
      this.connectionHandler.subscribeConnection('getDevTimeLine', req);
      //this.socketdataservice.getDevTimeLine(req);
    }
  }

  @HostListener('document:GraphUpdate', ['$event'])
  onGraphUpdate(param) {
    this.spinner.show();
    //setTimeout(() => { this.spinner.hide(); }, 15000);
    var req = {
      startTime: +param.detail.startTime,
      endTime: +param.detail.endTime
    };
    if (this.Checking_customer_id) {
      //this.socketdataservice.getDevOverView(req);
      this.connectionHandler.subscribeConnection('getDevOverView', req);
    }
  }

  @HostListener('document:LiveUpdate', ['$event'])
  onLiveupdate(state) {
    var param = {
      onlineCnt: JSON.parse(localStorage.getItem('devonnet'))['onlineDevCnt']
    };
    var resp = {
      event: 'GraphEvent',
      method: 'LiveFeed',
      param: param
    };
    if (this.unityAppRegistry.loadedScene == 'Topology') {
      this.unityService.sendMessage(
        'LibraryLinker',
        'AngularEventDispatch',
        resp,
        this.unityAppInstance.appInstance
      );
    }
  }

  @HostListener('document:UnityAppLoaderStatus', ['$event'])
  onUnityLoad(param) {
    this.unityService.RegisterUnityApplicaiton(param);
    this.unityAppInstance = this.unityService.getInstance();
    this.isUnityLodaded = true;
    this.spinner.hide();
    if (localStorage.getItem('last_loaded_screen') != null) {
      this.router.navigate([localStorage.getItem('last_loaded_screen')]);
    } else {
      this.router.navigate(['/alldevices/dashboard']);
    }
  }

  constructor(
    private connectionHandler: ConnectionHandler,
    public router: Router,
    private mapgl: MapGL,
    private intercommunicationService: IntercommunicationService,
    public unityService: UnityService,
    private spinner: NgxSpinnerService,
    private location: PlatformLocation,
    private unityAppRegistry: UnityAppRegistry,
    private sessionManager: SessionManagerService,
    private route: ActivatedRoute,
    private socketdataservice: SocketdataService,
    private toastr: ToastrService,
    private formBuilder: FormBuilder
  ) {
    location.onPopState(() => {
      // console.log(' All devices : pressed Back button!');
    });
    this.customer_id = parseInt(localStorage.getItem('setting_customer_id'));
    if (window.performance) {
    }
    if (performance.navigation.type == 1) {
      if (localStorage.getItem('first_time_login') == 'true') {
        this.display = true;
      } else {
        this.display = false;
      }
    } else {
      console.info('This page is not reloaded');
    }
  }

  ngOnInit() {
    this.connectionHandlerCallback = this.connectionHandler.getCallback().subscribe(info => {
      // off loading;
      this.spinner.hide();
    });
    //this.intercommunicationService.setDeviceClickEvent(true);
    this.FromDateValue = new Date();
    this.ToDateValue = new Date();

    this.intercommunicationService.setpageBg(true); // setting page bg
    if (localStorage.getItem('first_time_login') == 'true') {
      this.display = true;
    } else {
      this.display = false;
    }

    this.socketdataservice.getCustomerList().subscribe(info => {
      this.Checking_customer_id = true;
    });

    // console.log('alldevice_check', this.unityService.isDesktop);
    this.mapgl.DrawImage();
    if (!this.unityService.binaryStatus && this.unityService.isDesktop) {
      // false
      this.spinner.show();

      var divElement = document.createElement('div');
      divElement.id = 'Unity-Akitra';
      divElement.style.width = '100%';
      divElement.style.height = '100%';
      var parentHTML: any = document.getElementById('UnityLobby');
      parentHTML.appendChild(divElement);
      this.unityService.load('Unity-Akitra', 'assets/TimeLine/DevTimeLine.json');
      this.unityAppRegistry.RegisterAppCanvas(divElement);
    } else {
      this.isUnityLodaded = true;
      if (localStorage.getItem('last_loaded_screen') != null) {
        this.router.navigate([localStorage.getItem('last_loaded_screen')]);
      } else {
        this.router.navigate(['/alldevices/dashboard']);
      }
    }

    this.graphViewEvent = this.socketdataservice.setDevOverView().subscribe(info => {
      this.connectionHandler.unsubscribeConnection();
      var param = {
        event: 'GraphEvent',
        method: 'RenderGraph',
        param: info
      };
      if (this.unityAppRegistry.loadedScene == 'Topology') {
        this.unityService.sendMessage(
          'LibraryLinker',
          'AngularEventDispatch',
          param,
          this.unityAppInstance.appInstance
        );
      }
    });
    this.dropDownEvent = this.intercommunicationService
      .getheaderdropdownClicked()
      .subscribe(info => {
        if (
          this.unityService.binaryStatus &&
          this.router.url == '/alldevices/twodimension' &&
          this.unityService.isDesktop
        ) {
          this.isLive = false;
        }
      });
    this.connection = this.socketdataservice.getDeviceInfo().subscribe(info => {
      if (
        this.unityService.binaryStatus &&
        this.router.url == '/alldevices/twodimension' &&
        this.unityService.isDesktop
      ) {
        if (info['totDevCnt'] == 0) {
          //this.sessionManager.UnSubscribeSession();
        } else {
          if (localStorage.getItem('devonnet')) {
            let previousState = JSON.parse(localStorage.getItem('devonnet'));
            if (
              previousState['totDevCnt'] != info['totDevCnt'] ||
              previousState['onlineDevCnt'] != info['onlineDevCnt'] ||
              previousState['totIncidentsCnt'] != info['totIncidentsCnt']
            ) {
              if (this.isLive) {
                var req = {
                  startTime: this.lastUpdateTimestamp,
                  endTime: Date.now() //Math.floor(Date.now() / 1000)
                };
                if (this.Checking_customer_id) {
                  this.socketdataservice.getTopologyUpdate(req);
                }
              } // Changes is there
            }
          } else {
            // No Changes
          }
        }
      }
    });

    this.topologyLiveEvent = this.socketdataservice.setTopologyLive().subscribe(info => {
      if (info) {
        var _info: any = info;

        this.lastUpdateTimestamp = info['lastUpdatedTimeStamp'];
        this.timeStampSplit[this.timeStampSplit.length - 1] = Math.floor(Date.now() / 1000);

        if (info['newdevices'].length > 0) {
          for (var i = 0; i < info['newdevices'].length; i++) {
            this.deviceInfo[Object.keys(this.deviceInfo).length] = info['newdevices'][i];
            this.totalDevices[Object.keys(this.totalDevices).length - 1].push(
              Object.keys(this.deviceInfo).length
            );
            this.onlineDevices[Object.keys(this.onlineDevices).length - 1].push(
              Object.keys(this.deviceInfo).length
            );
          }
        }
        if (info['onlinedevices'].length > 0) {
          this.onlineDevices[Object.keys(this.onlineDevices).length - 1] = [];
          for (var j = 0; j < info['onlinedevices'].length; j++) {
            for (var i = 0; i < Object.keys(this.deviceInfo).length; i++) {
              var index;
              if (
                this.deviceInfo[i]['mac_address'] +
                '-' +
                this.deviceInfo[i]['ipaddress'] +
                '-' +
                this.deviceInfo[i]['license_key'] ==
                info['onlinedevices'][j]['_id']
              ) {
                index = i;
                break;
              }
            }
            this.onlineDevices[Object.keys(this.onlineDevices).length - 1].push(index);
            //this.onlineDevices[this.onlineDevices.length - 1].push(index);
          }
        } else {
          this.onlineDevices[Object.keys(this.onlineDevices).length - 1] = [];
        }

        this.computeDeviceHistory(this.timeStampSplit[this.timeStampSplit.length - 1]);
      }
    });

    this.devTimeLineEvent = this.socketdataservice.setDevTimeLine().subscribe(info => {
      if (info) {
        this.tempOnlineDevices = JSON.parse(JSON.stringify(info['onlineDev']));
        this.tempTotalDevices = JSON.parse(JSON.stringify(info['totalDev']));
        //setTimeout(() => {   this.isLive = true; }, 100);
        this.lastUpdateTimestamp = info['lastUpdatedTimeStamp'];
        this.timeStampSplit = info['intervals'];
        this.totalDevices = info['totalDev'];
        this.onlineDevices = info['onlineDev'];
        this.deviceInfo = info['devInfo'];
        this.subnetInfo = info['subnetInfo'];

        for (var i = 0; i < Object.keys(this.tempOnlineDevices).length; i++) {
          this.tempOnlineDevices[i].find(x =>
            this.deviceInfo.hasOwnProperty(x) ? null : this.removeChunk(x, i)
          );
        }
        for (var i = 0; i < Object.keys(this.tempTotalDevices).length; i++) {
          this.tempTotalDevices[i].find(x =>
            this.deviceInfo.hasOwnProperty(x) ? null : this.removeChunk_total(x, i)
          );
        }
        this.connectionHandler.unsubscribeConnection();
        var param = {
          event: 'TopologyTimeLineEvent',
          method: 'InitTimeLine',
          param: null
        };
        if (this.unityAppRegistry.loadedScene == 'Topology') {
          this.unityService.sendMessage(
            'LibraryLinker',
            'AngularEventDispatch',
            param,
            this.unityAppInstance.appInstance
          );
        }
        //this.spinner.hide();
      }
    });

    this.RowClickedStateInAlldevice = this.intercommunicationService
      .getRowClickedState()
      .subscribe(mdata => {
        if (mdata) {
          this.socketdataservice.requestNodeDetails(mdata);
          this.displayModelFullPage = true;
        }
      });

    this.navigationClickEvent = this.intercommunicationService
      .getNavigationClickEvent()
      .subscribe(info => {
        if (info == 'dtable') {
          this.router.navigate(['/alldevices/dtable']);
          //setTimeout(() => {  }, 700);
        } else if (info == 'topology') {
          this.router.navigate(['/alldevices/twodimension']);
          //setTimeout(() => {  }, 100);
        } else if (info == 'dashboard') {
          // this.router.navigate(['/alldevices/dashboard']);
          setTimeout(() => {
            this.router.navigate(['/alldevices/dashboard']);
          }, 700);
        } else if (info == 'settings') {
          this.router.navigate(['/alldevices/settings']);
          //setTimeout(() => { }, 700);
        } else if (info == 'reports') {
          this.router.navigate(['/alldevices/reports']);
        }
      });

    this.updatepasswordForm = this.formBuilder.group(
      {
        password: [
          '',
          Validators.compose([
            Validators.required,
            Validators.pattern("^(?=.*?[A-Z])(?=.*?[a-z])(?=.*?[0-9])(?=.*?[#?!@$%^&*-]).{8,}$")
          ])
        ],
        confirmPassword: [
          '',
          Validators.compose([Validators.required])
        ]
      },
      {
        validator: MustMatch('password', 'confirmPassword')
      }
    );
  }
  removeChunk(x, i) {
    var index = this.onlineDevices[i].indexOf(x);
    this.onlineDevices[i].splice(index, 1);
  }
  removeChunk_total(x, i) {
    var index = this.totalDevices[i].indexOf(x);
    this.totalDevices[i].splice(index, 1);
  }
  get f() {
    return this.updatepasswordForm.controls;
  }

  public computeDeviceHistory(timeStamp) {
    var index;
    if (this.timeStampSplit) {
      if (this.timeStampSplit.length > 0) {
        for (var i = 0; i < this.timeStampSplit.length - 1; i++) {
          if (timeStamp >= this.timeStampSplit[i] && timeStamp <= this.timeStampSplit[i + 1]) {
            index = i;
            if (this.totalDevices[index].length > 0) {
              // this.sessionManager.SetAnimationState(true);

              this.sessionManager.filterData(
                this.totalDevices[index],
                1,
                this.onlineDevices[index],
                this.deviceInfo,
                this.subnetInfo
              );
              //this.sessionManager.AddDevice(this.totalDevices[index], this.onlineDevices[index], this.deviceInfo, this.subnetInfo, null);
            } else {
              this.sessionManager.ResetDevice();
              // this.sessionManager.SetAnimationState(false);
            }
            break;
          }
        }
      }
    }
  }

  private nodeSelected() {
    const elem: HTMLElement = document.getElementById('popupoverLay') as HTMLElement;
    elem.click();
  }

  /**
   * FnRefreshPage
   */
  public Refresh() {
    this.sessionManager.ResetDevice();
  }
  /**
   * on Click The Calendar
   */
  public onClickTheCalendar() {
    //console.log('onClickTheCalendar');
  }

  public onSelectToDate(toDate: any) {
    //console.log(toDate);
  }
  public onSelectFromDate(fromDate: any) {
    // console.log(fromDate);
  }

  public onSelectToTime(toTime: any) {
    // console.log(toTime);
  }
  public onSelectFromTime(fromTime: any) {
    //  console.log(fromTime);
  }

  public ngOnDestroy() {
    this.dropDownEvent.unsubscribe();
    this.topologyLiveEvent.unsubscribe();
    this.graphViewEvent.unsubscribe();
    this.devTimeLineEvent.unsubscribe();
    this.connection.unsubscribe();
    this.RowClickedStateInAlldevice.unsubscribe();
  }

  update_password() {
    this.submitted = true;
    if (this.updatepasswordForm.invalid) {
      return;
    }

    var change_password_json = {
      oldPwd: atob(localStorage.getItem('old_password')),
      newPwd: this.model.newpassword,
      token: localStorage.getItem('token')
    };
    this.socketdataservice.setchangePassword(change_password_json);
    this.socketdataservice.getchangePassword().subscribe(data => {
      if (data == true) {
        this.toastr.info('Updated successfully');
        this.display = false;
        this.intercommunicationService.settingClicked(true);
        if (localStorage.getItem('ROLE') != '3') {
          this.router.navigate(['/alldevices/settings']);
        }
        localStorage.setItem('move_to_setting', '1');
        localStorage.setItem('first_time_login', 'false');
      } else {
        this.toastr.error('Failed');
        this.display = true;
      }
    });
  }

  close_login() {
    this.goto_login_popup = false;
    window.location.href = '/';
  }

  /**
   * resetDate
   */
  public resetDate() {
    this.toastr.info('Initial date reseted', 'Event Log');
    // if (this.FromDateValue && this.ToDateValue) {
    this.FromDateValue = this.resetStartDate;
    this.ToDateValue = this.resetEndDate;

    this.FromTimeValue = this.resetStartDate;
    this.ToTimeValue = this.resetEndDate;
    // this.calenderMode = false;
    // this.State = 'First';
  }

  // TimeMachine : get slider time duration from date component

  public getCalDurationDates(ee) {
    var param_req = {
      event: 'TopologyTimeLineEvent',
      method: 'Refresh',
      param: null
    };
    if (this.unityAppRegistry.loadedScene == 'Topology') {
      this.unityService.sendMessage(
        'LibraryLinker',
        'AngularEventDispatch',
        param_req,
        this.unityAppInstance.appInstance
      );
    }
    //this.unityService.sendMessage('LibraryLinker', 'AngularEventDispatch', param_req, this.unityAppInstance.appInstance);

    // console.log(this.FromDateValue + ' <- date>' + this.FromTimeValue);
    //console.log(this.ToDateValue + ' <-time>' + this.ToTimeValue);

    const fromyear = this.FromDateValue.getFullYear();
    const frommonth = this.FromDateValue.getMonth();
    const fromday = this.FromDateValue.getDate();

    let fromhours = this.FromTimeValue.getHours();
    let fromminutes = this.FromTimeValue.getMinutes();
    let fromseconds = this.FromTimeValue.getSeconds();

    if (this.FromTimeValue) {
      fromhours = this.FromTimeValue.getHours();
      fromminutes = this.FromTimeValue.getMinutes();
      fromseconds = this.FromTimeValue.getSeconds();
    }

    // console.log("year"+year+"month"+month+"day"+day+"hours"+hours+"minutes"+minutes+"seconds"+seconds);

    const fromdateOnly =
      fromyear +
      '-' +
      frommonth +
      '-' +
      fromday +
      ' ' +
      fromhours +
      ':' +
      fromminutes +
      ':' +
      fromseconds;

    const date = new Date();
    date.setFullYear(fromyear);
    date.setMonth(frommonth);
    date.setDate(fromday);
    date.setHours(fromhours);
    date.setMinutes(fromminutes);
    date.setSeconds(fromseconds);
    // console.log(dateOnly + '   //  ' + this.convertDate2Epoc(fromdateOnly));
    const tempendTime = this.convertDate2Epoc(date);

    // if (this.resetStartDate  >= tempStartTime){
    // this.endTime = tempendTime.toString();
    this.FromDateValue = this.epochToDate(this.insert(tempendTime.toString()));
    // }
    // else{
    //   //Mismatch
    // }

    const toyear = this.ToDateValue.getFullYear();
    const tomonth = this.ToDateValue.getMonth();
    const today = this.ToDateValue.getDate();

    const tohours = this.ToTimeValue.getHours();
    const tominutes = this.ToTimeValue.getMinutes();
    const toseconds = this.ToTimeValue.getSeconds();

    // console.log("year"+year+"month"+month+"day"+day+"hours"+hours+"minutes"+minutes+"seconds"+seconds);

    const todateOnly =
      toyear + '-' + tomonth + '-' + today + ' ' + tohours + ':' + tominutes + ':' + toseconds;
    const _date = new Date();
    _date.setFullYear(toyear);
    _date.setMonth(tomonth);
    _date.setDate(today);
    _date.setHours(tohours);
    _date.setMinutes(tominutes);
    _date.setSeconds(toseconds);

    const temptoStartTime = this.convertDate2Epoc(_date);

    //console.log(temptoStartTime + ' / ' + tempendTime);

    var req = {
      startTime: temptoStartTime,
      endTime: tempendTime
    };
    if (this.Checking_customer_id) {
      this.socketdataservice.getDevTimeLine(req);
    }

    // if (this.resetEndDate  >= temptoStartTime){
    // this.startTime = temptoStartTime.toString();
    this.ToDateValue = this.epochToDate(this.insert(temptoStartTime.toString()));
    // }
    // else{
    //     // mismatch
    // }

    // var fromDateVal = new Date() '2010-12-30 9:57:58  2018-4-21 13:3:54

    // console.log(
    //   this.convertDate2Epoc(this.FromDateValue) +
    //     ' <- date>' +
    //     this.convertDate2Epoc(this.ToDateValue)
    // );
    // console.log(
    //   this.convertDate2Epoc(this.ToTimeValue) +
    //     ' <-time>' +
    //     this.convertDate2Epoc(this.FromTimeValue)
    // );

    // this.resetStartDate = this.epochToDate(this.endTime);
    // this.resetEndDate = this.epochToDate(this.startTime);

    // if (){}else{}
    if (tempendTime && temptoStartTime) {
      if (new Date(this.FromDateValue).getTime() < new Date(this.ToDateValue).getTime()) {
        this.startTime = (this.insert(temptoStartTime.toString()) + '.999999999').toString();
        this.endTime = (this.insert(tempendTime.toString()) + '.000000000').toString();

        this.updateCalenderTime(true);
        this.updateCalenderTime(false);

        // console.log(this  .startTime + ' <->' + this.startTime);
        // this.deviceinfoTableHide = false;
        // this.eventTableHide = true;
        // this.isPlaying = false;
        // this.slider_val = 0.0;
        // this.pauseSlider(null);
        // this.appRegistry.SetcanPushRecords(false);
        // this.intercommunicationService.setClearRecord(null);

        // const _parameter = {};
        // _parameter['isVictim'] =
        //   this.appRegistry.getDeviceType() === 'victim' ? true : false;
        // _parameter['macaddress'] = this.selectedMacAddress;
        // _parameter['startTime'] = this.startTime;
        // _parameter['endTime'] = this.endTime;
        // this.socketservice.requestSliderRangeCnt(_parameter);

        const data = {
          time_stamp_raw: this.startTime,
          endTime: this.endTime
        };
        // this.intercommunicationService.setInterMediateSliderChange(data);
        // this.State = 'Calender';
        // this.onPause = false;
        // this.calenderMode = true;
        // this.btnClose.nativeElement.click();
        // this.btnClose.nativeElement.click();
      } else {
        this.toastr.error('Please select from date should be less than To date', 'Event log');
      }
    } else {
      this.toastr.error('Please select two different date to proceed', 'Event log');
    }
  }

  updateCalenderTime(type) {
    if (type) {
      const monthAndDate = this.FromDateValue.toString()
        .substr(3, 12)
        .toUpperCase();
      const timeinSec = this.FromDateValue.toString().substr(16, 8);
      this.sliderStartSeverTime = monthAndDate + ' | ' + timeinSec;
    } else {
      const monthAndDate = this.ToDateValue.toString()
        .substr(3, 12)
        .toUpperCase();
      const timeinSec = this.ToDateValue.toString().substr(16, 8);
      this.sliderStopSeverTime = monthAndDate + ' | ' + timeinSec;
    }
  }

  /**
   * convertDate2Epoc
   */
  public convertDate2Epoc(date) {
    return date.getTime();
  }

  /**
   * onOpenFullSidebar
   */
  public onOpenFullSidebar(e: any) {
    this.displayModelFullPage = false;
    localStorage.setItem('crowd_sourcing_popup', 'onHide');
    // console.log('onHide : crowd sourcing popup  ');
    localStorage.setItem('crowdPopupAppearedforSettings', '0');
    this.intercommunicationService.enableSettingsGear(true);
  }

  /**
   * onOpenCrowdSourcing
   */
  public onOpenCrowdSourcing(e: any) {
    localStorage.setItem('crowd_sourcing_popup', 'onShow');
    // console.log('onShow : crowd sourcing popup  ');
  }

  // TimeMachine : get slider time duration from date component
  public insert(str) {
    // return str.substr(0, index) + value + str.substr(index);
    return str.slice(0, 10);
  }

  public epochToDate(value) {
    let unix_seconds = value;
    if (unix_seconds) {
      if (unix_seconds < 10000000000) {
        unix_seconds *= 1000;
      }
      const fulldate = new Date(unix_seconds + new Date().getTimezoneOffset() * -1);
      return fulldate;
    }
  }

  public cancelCalDurationDates() {
    this.resetDate();
  }
}
