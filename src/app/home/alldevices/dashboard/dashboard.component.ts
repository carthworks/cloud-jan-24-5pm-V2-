import * as moment from 'moment';
import { Component, OnDestroy, OnInit, ViewChild, HostListener } from '@angular/core';
import { Router } from '@angular/router';
import { UnityService } from '../services/UnityService.service';
import { Subscription } from 'rxjs';
import { IntercommunicationService } from 'src/app/services/intercommunication.service';
import { SocketdataService } from 'src/app/services/socketdata.service';
import { NgxSpinnerService } from 'ngx-spinner';
import { Chart } from 'chart.js';
import { ConnectionHandler } from 'src/app/services/connectionHandler.service';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent implements OnDestroy, OnInit {


  div1: any;
  div2: any;
  div3: any;
  div4: any;

  @ViewChild('lineChart') private chartRef;
  lineChart: any;

  googleLogoColors: any[] = ['#b7708c', '#7dd35c', '#3ebce0', '#9b9c9d'];
  googleRed: string = '#9b9c9d';
  hexIcons: any = {
    '#b7708c': '/assets/dashboard/hex-red.svg',//pink
    '#7dd35c': '/assets/dashboard/hex-green.svg',//green
    '#9b9c9d': '/assets/dashboard/hex-yellow.svg',// grey
    '#3ebce0': '/assets/dashboard/hex-blue.svg', // blue
    '#df5b53': '/assets/dashboard/hex-high.svg',//red
    '#d28c3c': '/assets/dashboard/hex-medium.svg',//org
    '#fdfe6b': '/assets/dashboard/hex-low.svg'// yellow
  }

  lastUpdatedDevices: any = [];

  data: any;
  data_vulDevTypeInfo: any;
  data_attack: any;
  data_mitretype: any;
  newothers: any;


  data_dount_level: any;

  data_dount: any;
  dnout_chart_no: any;
  dount_data: any = [];
  Result_timedata: any = [];
  resultantDevTimeline: any[] = [];
  name_data: any = [];
  count_data: any = [];
  color_data: any = [];
  device_count: any = [];

  data_dount_online: any;
  online_chart_no: any;
  dount_data_online: any = [];
  device_count_online: any = [];
  color_online: any;
  name_data_online: any = [];
  count_data_online: any = [];
  color_data_online: any = [];

  data_dount_vul: any;
  dount_data_vul: any = [];
  vul_chart_no: any;
  device_count_vul: any = [];
  color_vul: any;
  name_data_vul: any = [];
  count_data_vul: any = [];
  color_data_vul: any = [];


  data_dount_inc: any;
  dount_data_inc: any = [];
  inc_chart_no: any;
  device_count_inc: any = [];
  color_inc: any;
  name_data_inc: any = [];
  count_data_inc: any = [];
  color_data_inc: any = [];


  mitretype_no: any;
  vulOsInfo_no: any;
  attacktechniques_no: any;
  vulAppInfo_no: any;
  vulDevTypeInfo: any;

  options: any;
  options_online: any;
  options_vul: any;
  options_inc: any;
  lineoptions: any;
  line_chart_no: any;
  devLineChart: boolean = false;

  Total_count: number = 0;
  Total_count_online: number = 0;
  Total_count_vulneerable: number = 0;
  Total_count_incidents: number = 0;
  connectionHandlerCallback: Subscription;
  dashBoardConnection: Subscription;
  devInfo: Subscription;
  dropDownChangeEvent: Subscription = null;


  final_maxvalue: any = [];
  final_minvalue: any = [];
  maxvalue_result: number = 0;
  minvalue_result: number = 0;

  view: any[];
  view1: any[];
  view2: any[];
  low_edges: any = [];
  high_edges: any = [];
  medium_edges: any = [];

  colors: any = {
    high: '#df5b53',
    medium: '#d28c3c',
    low: '#fdfe6b',
    unknown: '#999999',
    null: '#999999',
    none: '#999999'
  };
  total_MITRE_type: any = { count: 0, elements: [] };
  total_Vulneerable_Os_Info: any[] = [];
  total_ATTACK_type: any[] = [];
  total_Vulneerable_Application_Info: any[] = [];
  total_DEVICE_type: any = { count: 0, elements: [] };
  // options
  showYAxis = true;
  gradient = false;
  showLegend = false;
  showXAxisLabel = true;
  showYAxisLabel = true;

  status: boolean = false;

  colorScheme = {
    domain: ['#e14847', '#e06d30', '#655094', '#989898']
  };
  dashboardLoading: boolean = false;

  networkStatus: string = 'INITIALIZING';
  time = moment().format('h:mm A');
  date = moment().format('MMMM DD, YYYY');

  pgLoaderTimeOut: number = 20000;

  /* Prod build fixes */
  primaryColour: any;
  loadingTemplate: any;

  totalDevCnt = 0;
  totalOnlineCnt = 0;
  totalVulnerabilityCnt = 0;
  totAbnorDevCnt = 0;


  public ActivityListItem = [
    { menu_name: '12 Hrs', desc: '12 Hours', hour: 12, link_name: 'activity-link0', active: false },
    { menu_name: '24 Hrs', desc: '1 Day', hour: 24, link_name: 'activity-link1', active: false },
    { menu_name: '48 Hrs', desc: '2 Days ', hour: 48, link_name: 'activity-link2', active: false },
    { menu_name: '72 Hrs', desc: '3 Days ', hour: 72, link_name: 'activity-link3', active: false },
    { menu_name: '1 Week', desc: '1 Week', hour: 168, link_name: 'activity-link4', active: false }
  ];
  public IsActivityTimelineLoading: boolean = false;

  deviceTimelineOptions: any = {};
  deviceTimelineData: any;

  devDataIntervalTimer: any;

  osAllOthers: any[] = [];
  applicationAllOthers: any[] = [];
  attackTechniquesAllOthers: any[] = [];
  constructor(
    private connectionHandler: ConnectionHandler,
    private IntercommunicationService: IntercommunicationService,
    public unityService: UnityService,
    public router: Router,
    private socketdataService: SocketdataService,
    private spinner: NgxSpinnerService
  ) {
    if (window.innerHeight > 900) {
      this.view = [500, 80];
      this.view1 = [500, 110];
      this.view2 = [500, 130];
    } else {
      this.view = [400, 80];
      this.view1 = [400, 110];
      this.view2 = [400, 130];
    }

    this.IsActivityTimelineLoading = false;
    //this.prepareDashboard(this.mockResponse);
  }

  onSelect(event) {
    // console.log(event);
  }

  public isEmpty(obj) {
    for (let key in obj) {
      if (obj.hasOwnProperty(key)) {
        return false;
      }
    }
    return true;
  }

  ngOnInit() {
    this.connectionHandlerCallback = this.connectionHandler.getCallback().subscribe(info => {
      // off loading;
      this.dashboardLoading = false;
    });

    this.devInfo = this.IntercommunicationService.getDeviceInfoUpdate().subscribe(info => {
      if (info.status) {

        this.totalDevCnt = info['totDevCnt'];
        this.totalOnlineCnt = info['onlineDevCnt'];
        this.totalVulnerabilityCnt = info['totIncidentsCnt'];
        this.totAbnorDevCnt = info['totAbnorDevCnt'];

        if (parseInt(localStorage.getItem('setting_customer_id')) == 0) {
          var CustomerID = parseInt(localStorage.getItem('customer_id_host'));
        } else {
          var CustomerID = parseInt(localStorage.getItem('customer_id'));
        }
        var parameter = {
          token: localStorage.getItem('token'),
          customer_id: CustomerID,
          reqId: 0
        };
        this.dashboardLoading = true;
        this.connectionHandler.subscribeConnection('setdashboard', parameter);
        this.loadAndUpdateState();
      } else {
        //console.log("NO change")
      }
    });

    let parameter = {
      token: localStorage.getItem('token'),
      customer_id: parseInt(localStorage.getItem('customer_id_host')),
      reqId: 0
    };
    this.dashboardLoading = true;
    this.connectionHandler.subscribeConnection('setdashboard', parameter);
    this.dropDownChangeEvent = this.IntercommunicationService.getheaderdropdownClicked().subscribe(
      data => {
        this.IsActivityTimelineLoading = true;
        //this.prepareDashboard(this.mockResponse);
        this.IsActivityTimelineLoading = false;
        this.IntercommunicationService.setmapMarkerRemoveEvent(null);

        localStorage.removeItem('activityStatus');

        this.ActivityListItem.map(x => {
          x.active = false;
        });
        this.ActivityListItem[0].active = true;
      }
    );

    this.dashBoardConnection = this.socketdataService.getdashboard().subscribe(data => {

      this.connectionHandler.unsubscribeConnection();
      this.prepareDashboard(data);

    });

    if (!this.unityService.binaryStatus && this.unityService.isDesktop) {
      this.router.navigate(['/alldevices']);
    } else {
      localStorage.setItem('last_loaded_screen', '/alldevices/dashboard');
    }

    this.loadAndUpdateState();

    localStorage.removeItem('devonnet');
    this.socketdataService.requestDeviceInfo();

    this.devDataIntervalTimer = setInterval(() => {
      this.socketdataService.requestDeviceInfo();
    }, 15000)
  }

  loadAndUpdateState() {
    // seperate call for activity
    if (localStorage.getItem('activityStatus') != null) {
      const currentActivityStatus = JSON.parse(localStorage.getItem('activityStatus'));
      // alert(currentActivityStatus);

      let parameter = {
        token: localStorage.getItem('token'),
        customer_id: parseInt(localStorage.getItem('customer_id_host')),
        reqId: 1,
        lastHrs: currentActivityStatus
      };

      this.connectionHandler.subscribeConnection('setdashboard', parameter);

      this.ActivityListItem.filter(x => {
        if (x.hour === currentActivityStatus) {
          x.active = true;
        }
      });
    } else {
      this.ActivityListItem[0].active = true;
    }
  }

  first_three_name: any = [];
  first_three_discovered: any;
  top_four_device: any = [];
  public prepareDashboard(data) {
    this.Result_timedata = [];
    this.low_edges = [];
    this.medium_edges = [];
    this.high_edges = [];

    if (data['reqId'] == 0) {
      this.dount_data = [];
      this.Result_timedata = [];
      this.resultantDevTimeline = [];
      this.Total_count = data['totDevCnt'] ? data['totDevCnt'] : 0;
      this.Total_count_online = data['onlineDevCnt'] ? data['onlineDevCnt'] : 0; // online is os
      this.Total_count_vulneerable = data['totDevOsCnt'] ? data['totDevOsCnt'] : 0; // os is vulnerable
      this.Total_count_incidents = data['totIncidentsCnt'] ? data['totIncidentsCnt'] : 0;

      this.dount_data_online = [];
      this.dount_data_vul = [];
      this.dount_data_inc = [];

      if (this.isEmpty(data)) {
        this.dnout_chart_no = 0
        this.online_chart_no = 0
        this.vul_chart_no = 0
        this.inc_chart_no = 0
        this.mitretype_no = 0
        this.vulOsInfo_no = 0
        this.attacktechniques_no = 0
        this.vulAppInfo_no = 0
        this.line_chart_no = 0
      } else {
        if (typeof Object.keys(data) !== 'undefined' && Object.keys(data).length > 0) {

          if (this.isEmpty(data['mitretype'])) {
            this.mitretype_no = 0;
            this.total_MITRE_type = { count: 0, elements: [] };
          } else {
            this.mitretype_no = 1;


            var sorted = {}
            var other = {}
            Object.keys(data['mitretype']).sort(function (a, b) {
              return data['mitretype'][b].high - data['mitretype'][a].high;
            })
              .forEach(function (key) {
                sorted[key] = data['mitretype'][key];
                Object.keys(key)
              });
            this.data_mitretype = sorted;
            Object.keys(this.data_mitretype).map((key, index) => {
              if (index >= 4) {
                other[key] = this.data_mitretype[key];
                delete this.data_mitretype[key]
              }
            })

            this.newothers = Object.keys(other);

            if (Object.keys(other).length) {
              var high = 0;
              var medium = 0;
              var low = 0;
              for (var h in other) {
                high += other[h].high
                medium += other[h].medium
                low += other[h].low
              }

              this.data_mitretype["all others (" + Object.keys(other).length + ")"] = { "high": high, "medium": medium, "low": low }
            }

            this.prepare_MITRE_TYPE(this.data_mitretype);
          }

          if (this.isEmpty(data['vulOsInfo'])) {
            this.vulOsInfo_no = 0;
            this.total_Vulneerable_Os_Info = [];
          } else {
            this.vulOsInfo_no = 1;
            this.prepare_Vulneerable_Os_Info(data['vulOsInfo']);
          }

          if (this.isEmpty(data['attacktechniques'])) {
            this.attacktechniques_no = 0;
            this.total_ATTACK_type = [];
          } else {
            this.attacktechniques_no = 1;

            this.prepare_ATTACK_TYPE(data['attacktechniques']);
          }

          if (this.isEmpty(data['vulAppInfo'])) {
            this.vulAppInfo_no = 0;
            this.total_Vulneerable_Application_Info = [];
          } else {
            this.vulAppInfo_no = 1;
            this.prepare_vulneerable_Application_Info(data['vulAppInfo']);
          }

          if (this.isEmpty(data['vulDevTypeInfo'])) {
            this.vulDevTypeInfo = 0;
            this.total_DEVICE_type = { count: 0, elements: [] };
          } else {
            this.vulDevTypeInfo = 1;
            var sorted = {}
            Object.keys(data['vulDevTypeInfo']).sort(function (a, b) {
              return data['vulDevTypeInfo'][b].total - data['vulDevTypeInfo'][a].total;
            })
              .forEach(function (key) {
                sorted[key] = data['vulDevTypeInfo'][key];
                Object.keys(key);
              });
            this.data_vulDevTypeInfo = sorted;
            Object.keys(this.data_vulDevTypeInfo).map((key, index) => {
              delete this.data_vulDevTypeInfo[key].total
              if (index > 3) {
                delete this.data_vulDevTypeInfo[key]
              }
            })
            this.prepare_device_type(this.data_vulDevTypeInfo);
          }


          if (this.isEmpty(data['totDevInfo'])) {
            this.dnout_chart_no = 0;
          } else {
            this.dnout_chart_no = 1;
            for (var key in data['totDevInfo']) {
              if (data['totDevInfo'].hasOwnProperty(key)) {
                var name = key;
                if (data['totDevInfo'][key] > 0) {
                  var count = data['totDevInfo'][key];
                  this.first_three_name.push(key)
                  this.dount_data.push({ name: name, count: count });
                }

                if (this.dount_data.length == 0) {
                  this.dnout_chart_no = 0;
                } else {
                  this.dnout_chart_no = 1;
                }
              }
            }
            this.dounghut_chart_discovered(this.dount_data);
          }

          // var discovered = this.first_three_name;
          // var first_three_discovered = discovered.slice(0, 3);      

          if (this.isEmpty(data['onlineDevInfo'])) {
            this.online_chart_no = 0;
          } else {
            this.online_chart_no = 1;
            for (var key in data['onlineDevInfo']) {
              if (data['onlineDevInfo'].hasOwnProperty(key)) {
                var name_online = key;
                if (data['onlineDevInfo'][key] > 0) {
                  var count_online = data['onlineDevInfo'][key];
                  this.dount_data_online.push({
                    name_online: name_online,
                    count_online: count_online
                  });
                }

                if (this.dount_data_online.length == 0) {
                  this.online_chart_no = 0;
                } else {
                  this.online_chart_no = 1;
                }

              }
            }
            this.dounghut_chart_online(this.dount_data_online);
          }

          if (this.isEmpty(data['totDevOsInfo'])) {
            this.vul_chart_no = 0;
          } else {
            this.vul_chart_no = 1;
            data['totDevOsInfo'] = this.consolidateGroupAssetOs(data['totDevOsInfo']);
            for (var key in data['totDevOsInfo']) {
              if (data['totDevOsInfo'].hasOwnProperty(key)) {
                // var name_vul = key.toUpperCase();
                var name_vul = key
                if (data['totDevOsInfo'][key] > 0) {
                  var countt_vul = data['totDevOsInfo'][key];
                  this.dount_data_vul.push({
                    name_vul: name_vul,
                    count_vul: countt_vul
                  });
                }

                if (this.dount_data_vul.length == 0) {
                  this.vul_chart_no = 0;
                } else {
                  this.vul_chart_no = 1;
                }
              }
            }
            this.dounghut_chart_vul(this.dount_data_vul);
          }

          if (this.isEmpty(data['totIncidents'])) {
            this.inc_chart_no = 0;
            this.dount_data_inc = [{ "name_inc": "high", "count_inc": 0, "color_inc": "#df5b53" }, { "name_inc": "medium", "count_inc": 0, "color_inc": "#d28c3c" }, { "name_inc": "low", "count_inc": 0, "color_inc": "#fdfe6b" }];
          } else {
            this.inc_chart_no = 1;
            for (var key in data['totIncidents']) {
              if (data['totIncidents'].hasOwnProperty(key)) {
                var name_inc = key.toUpperCase();
                var countt_inc = data['totIncidents'][key];
                this.dount_data_inc.push({
                  name_inc: name_inc,
                  count_inc: countt_inc
                });
              }
            }

            this.dounghut_chart_inc(this.dount_data_inc);
          }
          this.line_chart_method(data);
          this.IntercommunicationService.setmapMarkerAddEvent(null);
        }
      }
    } else if (data['reqId'] == 1) {
      this.IsActivityTimelineLoading = false;
      this.line_chart_method(data);
    }
  }

  public line_chart_method(data) {
    let hoursToSubtract = JSON.parse(localStorage.getItem('activityStatus')) == null ? 12 : JSON.parse(localStorage.getItem('activityStatus'));

    let edgesToExclude: any[] = [];
    let lastTimestamp = data['deviceVulActivity']['vertices'][data['deviceVulActivity']['vertices'].length - 1];
    for (var i in data['deviceVulActivity']['vertices']) {
      if (moment.unix(data['deviceVulActivity']['vertices'][i]).isSameOrAfter(moment.unix(lastTimestamp).subtract(hoursToSubtract, 'hours'))) {
        this.Result_timedata.push(moment.unix(data['deviceVulActivity']['vertices'][i]).format('Do MMM h:mm A'));
      } else {
        edgesToExclude.push(i);
      }
    }

    // console.log(this.Result_timedata);

    // console.log(moment.unix(data['updatedAt']).format('Do MMM h:mm A'));

    // last time point bug fix by updatedAt
    this.Result_timedata[this.Result_timedata.length - 1] = moment.unix(data['updatedAt']).format('Do MMM h:mm A');

    //console.log(this.Result_timedata);

    if (this.isEmpty(data['deviceVulActivity'])) {
      this.line_chart_no = 0;
    } else {
      this.line_chart_no = 1;
      var edges = Object.values(data['deviceVulActivity']['edges']);
      for (var k in edges) {
        if (!edgesToExclude.includes(k)) {
          this.low_edges.push(edges[k]['low']);
          this.medium_edges.push(edges[k]['medium']);
          this.high_edges.push(edges[k]['high']);
        }
      }

      // this.low_edges.unshift(0);
      // this.medium_edges.unshift(0);
      // this.high_edges.unshift(0);

      this.line_chart(this.Result_timedata, this.low_edges, this.medium_edges, this.high_edges);
    }
  }

  ngAfterViewInit() {
    document.getElementById('dashboard-height-fix').style.height = '100%';

    this.lineChart = new Chart(this.chartRef.nativeElement, {
      type: 'line',
      data: {},
      options: {}
    });
  }

  // bindCustomClicks() {
  //   setTimeout(() => {
  //     let customClicks = document.getElementsByClassName('custom-click');
  //     for (var i = 0; i < customClicks.length; i += 1) {
  //       customClicks[i].addEventListener('click', (e: Event) => this.customClick(e));
  //     }
  //   }, 1000);
  // }

  // customClick(e) {
  //   this.vulnerableSearch(e.target.innerText, 'INCIDENT');
  // }



  prepare_MITRE_TYPE(dataInput) {

    this.total_MITRE_type = { count: 0, elements: [] };
    Promise.resolve(
      Object.entries(dataInput).forEach(([key, master]) => {
        let childCount = 0;
        Object.entries(master).forEach(([key, value]) => {
          childCount = childCount + value;
        });
        this.total_MITRE_type.count = this.total_MITRE_type.count + childCount;
      })
    ).then(() => {
      Object.entries(dataInput).forEach(([key, master]) => {
        let childCount = 0;
        let slave: any = { count: 0, childs: [] };
        Promise.resolve(
          Object.entries(master).forEach(([key, value]) => {
            childCount = childCount + value;
          })
        )
          .then(() => {
            slave.value = childCount;
            slave.label = key;
            if (key == 'u2r') {
              slave.label = 'User to Root'
            }
            if (key == 'r2l') {
              slave.label = 'Remote to Local'
            }

            if (key == 'probe') {
              slave.label = 'Probe'
            }

            if (key == 'malware') {
              slave.label = 'Malware'
            }
            Object.entries(master).forEach(([key, value]) => {
              let dividerOrValue: any = value;
              let onePercentage = 100 / childCount;
              let element = {
                label: key,
                value: value,
                color: this.colors[key],
                width: `${dividerOrValue * onePercentage}%`
              };
              if (value != 0) {
                slave.childs.push(element);
              }
            });
          })
          .then(() => {
            this.total_MITRE_type.elements.push(slave);
            this.total_MITRE_type.elements.sort(function (a, b) {
              return b.value - a.value;
            });

          });
      });
    });
  }

  consolidateGroupAssetOs(data) {
    let validOs = ['windows', 'linux', 'mac'];
    let tempData: any = {};
    let tempWindows = 0;
    let tempLinux = 0;
    let tempMac = 0;

    Object.entries(data).forEach(([key, value]) => {
      let tempVal: any = value;
      if (key.toLowerCase().includes(validOs[0])) {
        tempWindows += tempVal;
        tempData['Windows'] = tempWindows;
      } else if (key.toLowerCase().includes(validOs[1])) {
        tempLinux += tempVal;
        tempData['Linux'] = tempLinux;
      } else if (key.toLowerCase().includes(validOs[2])) {
        tempMac += tempVal;
        tempData['Mac'] = tempMac;
      } else if (key.toLowerCase() == 'ios') {
        tempData['iOS'] = value
      } else if (key.toLowerCase() == 'arubaos') {
        tempData['ArubaOS'] = value
      } else {
        let cappedKey = this.capitalizeFirstLetter(key);
        tempData[cappedKey] = value
      }
    });

    return tempData;
  }

  consolidateGroupOs(data) {
    let validOs = ['windows', 'linux', 'mac'];
    let tempData: any = {};
    let tempWindows = {
      high: 0,
      medium: 0,
      low: 0
    };
    let tempLinux = { ...tempWindows };
    let tempMac = { ...tempWindows };
    Object.entries(data).forEach(([key, value]) => {
      if (key.toLowerCase().includes(validOs[0])) {
        tempWindows['high'] += value['high'];
        tempWindows['medium'] += value['medium'];
        tempWindows['low'] += value['low'];

        tempData['Windows'] = tempWindows;
      } else if (key.toLowerCase().includes(validOs[1])) {
        tempLinux['high'] += value['high'];
        tempLinux['medium'] += value['medium'];
        tempLinux['low'] += value['low'];

        tempData['Linux'] = tempLinux;
      } else if (key.toLowerCase().includes(validOs[2])) {
        tempMac['high'] += value['high'];
        tempMac['medium'] += value['medium'];
        tempMac['low'] += value['low'];

        tempData['Mac'] = tempMac;
      } else if (key.toLowerCase() == 'ios') {
        tempData['iOS'] = value
      } else if (key.toLowerCase() == 'arubaos') {
        tempData['ArubaOS'] = value
      } else {
        let cappedKey = this.capitalizeFirstLetter(key);
        tempData[cappedKey] = value
      }
    });

    return tempData;
  }

  capitalizeFirstLetter(string) {
    return string.charAt(0).toUpperCase() + string.slice(1);
  }

  prepare_Vulneerable_Os_Info(data) {
    this.total_Vulneerable_Os_Info = [];
    this.osAllOthers = [];

    data = this.consolidateGroupOs(data);

    Object.entries(data).forEach(([masterKey, masterValue]) => {
      let total = 0;
      Object.entries(masterValue).forEach(([key, value]) => {
        total += value;
      });
      data[masterKey]['total'] = total;
    });

    let sorted = {};
    Object.keys(data).sort(function (a, b) {
      return data[b].total - data[a].total;
    }).forEach(function (key) {
      sorted[key] = data[key];
    });

    let count = 0;
    let allOthersCount = 0;
    let tempArray: any[] = [];

    Object.entries(sorted).forEach(([masterKey, masterValue]) => {
      let tempObj: any = {};

      if (count < 3) {
        tempObj['label'] = masterKey;
        tempObj['tooltip'] = masterKey;
        tempObj['value'] = masterValue['total'];
        delete masterValue['total'];
        tempObj['elementValues'] = masterValue;

        tempArray.push(tempObj);
        count++;
      } else if (count == 3) {
        tempObj['label'] = `All Others (${++allOthersCount})`;
        tempObj['value'] = masterValue['total'];
        tempObj['tooltip'] = masterKey;
        this.osAllOthers.push(masterKey);

        let forAllOthers = {
          high: 0,
          medium: 0,
          low: 0
        };
        forAllOthers['high'] = masterValue['high'];
        forAllOthers['medium'] = masterValue['medium'];
        forAllOthers['low'] = masterValue['low'];
        tempObj['elementValues'] = forAllOthers;

        tempArray.push(tempObj);
        count++;
      } else {
        tempArray[3]['label'] = `All Others (${++allOthersCount})`;
        tempArray[3]['value'] += masterValue['total'];
        tempArray[3]['tooltip'] = `${tempArray[3]['tooltip']}, ${masterKey}`;
        this.osAllOthers.push(masterKey);

        tempArray[3]['elementValues']['high'] += masterValue['high'];
        tempArray[3]['elementValues']['medium'] += masterValue['medium'];
        tempArray[3]['elementValues']['low'] += masterValue['low'];
      }
    });

    tempArray.map(array => {
      let forChart = [];
      Object.entries(array['elementValues']).forEach(([childKey, childValue]) => {
        let dividerOrValue: any = childValue;
        let onePercentage = 100 / array['value'];
        let element = {
          label: childKey,
          value: childValue,
          color: this.colors[childKey],
          width: `${dividerOrValue * onePercentage}%`
        };

        if (childValue != 0) {
          forChart.push(element);
        }

      });
      this.total_Vulneerable_Os_Info.push({ ...array, ...{ forChart: forChart } });
    });
  }




  prepare_vulneerable_Application_Info(data) {
    this.total_Vulneerable_Application_Info = [];
    this.applicationAllOthers = [];

    Object.entries(data).forEach(([masterKey, masterValue]) => {
      let total = 0;
      Object.entries(masterValue).forEach(([key, value]) => {
        total += value;
      });
      data[masterKey]['total'] = total;
    });

    let sorted = {};
    Object.keys(data).sort(function (a, b) {
      return data[b].total - data[a].total;
    }).forEach(function (key) {
      sorted[key] = data[key];
    });

    let count = 0;
    let allOthersCount = 0;
    let tempArray: any[] = [];

    Object.entries(sorted).forEach(([masterKey, masterValue]) => {
      let tempObj: any = {};

      if (count < 3) {
        tempObj['label'] = masterKey;
        tempObj['tooltip'] = masterKey;
        tempObj['value'] = masterValue['total'];
        delete masterValue['total'];
        tempObj['elementValues'] = masterValue;

        tempArray.push(tempObj);
        count++;
      } else if (count == 3) {
        tempObj['label'] = `All Others (${++allOthersCount})`;
        tempObj['value'] = masterValue['total'];
        tempObj['tooltip'] = masterKey;
        this.applicationAllOthers.push(masterKey);

        let forAllOthers = {
          high: 0,
          medium: 0,
          low: 0
        };
        forAllOthers['high'] = masterValue['high'];
        forAllOthers['medium'] = masterValue['medium'];
        forAllOthers['low'] = masterValue['low'];
        tempObj['elementValues'] = forAllOthers;

        tempArray.push(tempObj);
        count++;
      } else {
        tempArray[3]['label'] = `All Others (${++allOthersCount})`;
        tempArray[3]['value'] += masterValue['total'];
        tempArray[3]['tooltip'] = `${tempArray[3]['tooltip']}, ${masterKey}`;
        this.applicationAllOthers.push(masterKey);

        tempArray[3]['elementValues']['high'] += masterValue['high'];
        tempArray[3]['elementValues']['medium'] += masterValue['medium'];
        tempArray[3]['elementValues']['low'] += masterValue['low'];
      }
    });

    tempArray.map(array => {
      let forChart = [];
      Object.entries(array['elementValues']).forEach(([childKey, childValue]) => {
        let dividerOrValue: any = childValue;
        let onePercentage = 100 / array['value'];
        let element = {
          label: childKey,
          value: childValue,
          color: this.colors[childKey],
          width: `${dividerOrValue * onePercentage}%`
        };
        if (childValue != 0) {
          forChart.push(element);
        }
      });
      this.total_Vulneerable_Application_Info.push({ ...array, ...{ forChart: forChart } });
    });
  }

  prepare_ATTACK_TYPE(data) {
    this.total_ATTACK_type = [];
    this.attackTechniquesAllOthers = [];

    Object.entries(data).forEach(([masterKey, masterValue]) => {
      let total = 0;
      Object.entries(masterValue).forEach(([key, value]) => {
        total += value;
      });
      data[masterKey]['total'] = total;
    });

    let sorted = {};
    Object.keys(data).sort(function (a, b) {
      return data[b].total - data[a].total;
    }).forEach(function (key) {
      sorted[key] = data[key];
    });

    let count = 0;
    let allOthersCount = 0;
    let tempArray: any[] = [];

    Object.entries(sorted).forEach(([masterKey, masterValue]) => {
      let tempObj: any = {};

      if (count < 3) {
        tempObj['label'] = masterKey;
        tempObj['tooltip'] = masterKey;
        tempObj['value'] = masterValue['total'];
        delete masterValue['total'];
        tempObj['elementValues'] = masterValue;

        tempArray.push(tempObj);
        count++;
      } else if (count == 3) {
        tempObj['label'] = `All Others (${++allOthersCount})`;
        tempObj['value'] = masterValue['total'];
        tempObj['tooltip'] = masterKey;
        this.attackTechniquesAllOthers.push(masterKey);

        let forAllOthers = {
          high: 0,
          medium: 0,
          low: 0
        };
        forAllOthers['high'] = masterValue['high'];
        forAllOthers['medium'] = masterValue['medium'];
        forAllOthers['low'] = masterValue['low'];
        tempObj['elementValues'] = forAllOthers;

        tempArray.push(tempObj);
        count++;
      } else {
        tempArray[3]['label'] = `All Others (${++allOthersCount})`;
        tempArray[3]['value'] += masterValue['total'];
        tempArray[3]['tooltip'] = `${tempArray[3]['tooltip']}, ${masterKey}`;
        this.attackTechniquesAllOthers.push(masterKey);

        tempArray[3]['elementValues']['high'] += masterValue['high'];
        tempArray[3]['elementValues']['medium'] += masterValue['medium'];
        tempArray[3]['elementValues']['low'] += masterValue['low'];
      }
    });

    tempArray.map(array => {
      let forChart = [];
      Object.entries(array['elementValues']).forEach(([childKey, childValue]) => {
        let dividerOrValue: any = childValue;
        let onePercentage = 100 / array['value'];
        let element = {
          label: childKey,
          value: childValue,
          color: this.colors[childKey],
          width: `${dividerOrValue * onePercentage}%`
        };
        if (childValue != 0) {
          forChart.push(element);
        }
      });
      this.total_ATTACK_type.push({ ...array, ...{ forChart: forChart } });
    });
  }

  prepare_device_type(dataInput) {
    this.total_DEVICE_type = { count: 0, elements: [] };
    Promise.resolve(
      Object.entries(dataInput).forEach(([key, master]) => {
        let childCount = 0;
        Object.entries(master).forEach(([key, value]) => {
          childCount = childCount + value;
        });
        this.total_DEVICE_type.count = this.total_DEVICE_type.count + childCount;
      })
    ).then(() => {
      Object.entries(dataInput).forEach(([key, master]) => {
        let childCount = 0;
        let slave: any = { count: 0, childs: [] };
        Promise.resolve(
          Object.entries(master).forEach(([key, value]) => {
            childCount = childCount + value;
          })
        )
          .then(() => {
            slave.value = childCount;
            slave.label = key;

            Object.entries(master).forEach(([key, value]) => {
              let dividerOrValue: any = value;
              let onePercentage = 100 / childCount;
              let element = {
                label: key,
                value: value,
                color: this.colors[key],
                width: `${dividerOrValue * onePercentage}%`
              };
              if (value != 0) {
                slave.childs.push(element);
              }
            });
          })
          .then(() => {
            this.total_DEVICE_type.elements.push(slave);
            this.total_DEVICE_type.elements.sort(function (a, b) {
              return b.value - a.value;
            });
          });
      });
    });


  }




  device_type_details(chipValue, chipType, forSearch) {
    let chipConfig: any = {
      chipValue: chipValue.toUpperCase(),
      chipType: chipType,
      isMultiple: chipValue.toLowerCase().includes('all others'),
      ifMultiple: forSearch == undefined ? [] : forSearch
    }

    localStorage.setItem('threatChipConfig', JSON.stringify(chipConfig));
    localStorage.setItem('threatChipFromDashboard', "yes");
    localStorage.setItem('isExactMatch', 'true');
    this.router.navigate(['/alldevices/assets']);
  }

  vulnerableSearch(chipValue, chipType) {
    let chipConfig: any = {
      chipValue: chipValue.toUpperCase(),
      chipType: chipType,
      isMultiple: chipValue.toLowerCase().includes('all others')
    }

    if (chipConfig['isMultiple']) {
      switch (chipType) {
        case 'OS':
          chipConfig['ifMultiple'] = this.osAllOthers;
          break;
        case 'APPLICATION':
          chipConfig['ifMultiple'] = this.applicationAllOthers;
          break;
        case 'ATTACK TYPE':
          chipConfig['ifMultiple'] = this.attackTechniquesAllOthers;
          break;
        default:
          chipConfig['ifMultiple'] = [];
      }
    } else {
      chipConfig['ifMultiple'] = [];
    }

    localStorage.setItem('threatChipConfig', JSON.stringify(chipConfig));
    localStorage.setItem('threatChipFromDashboard', "yes");
    localStorage.setItem('isExactMatch', 'true');
    this.router.navigate(['/alldevices/assets']);
  }

  goToThreat(chipValue, chipType) {
    let chipConfig: any = {
      chipValue: chipValue,
      chipType: chipType,
      isMultiple: chipValue.toLowerCase().includes('all others')
    }

    if (chipConfig['isMultiple']) {
      switch (chipType) {
        case 'OS':
          chipConfig['ifMultiple'] = this.osAllOthers;
          break;
        case 'APPLICATION':
          chipConfig['ifMultiple'] = this.applicationAllOthers;
          break;
        case 'ATTACK TYPE':
          chipConfig['ifMultiple'] = this.attackTechniquesAllOthers;
          break;
        default:
          chipConfig['ifMultiple'] = [];
      }
    } else {
      chipConfig['ifMultiple'] = [];
    }

    localStorage.setItem('threatChipConfig', JSON.stringify(chipConfig));
    localStorage.setItem('threatChipFromDashboard', "yes");
    this.router.navigate(['/alldevices/threats']);
  }

  device_all_other_count: any;
  device_online_all_other_count: any;
  device_vul_all_other_count: any;



  dounghut_chart_discovered(data) {
    this.data_dount = [];
    let consolidatedDiscovered: any = [];
    let colorIndex = 0;
    this.name_data = [];
    this.count_data = [];
    this.color_data = [];
    let uncategorizedHolder: any = null;

    data.sort(function (a, b) {
      return b.count - a.count;
    });

    data.map((child, i) => {
      if (child.name.toLowerCase() == 'uncategorized') {
        uncategorizedHolder = {};
        uncategorizedHolder = data.splice(i, 1)[0];
        uncategorizedHolder.color = this.googleRed;
      }
    });

    let dynaLen = data.length == 3 ? 3 : 2;

    for (var i in data) {
      if (parseInt(i) < dynaLen) {
        this.name_data.push(data[i].name);
        this.count_data.push(data[i].count);
        consolidatedDiscovered.push(data[i]);

        if (data[i].name.toLowerCase() == 'uncategorized') {
          this.color_data.push(this.googleRed);
          consolidatedDiscovered[i].color = this.googleRed;
        } else {
          this.color_data.push(this.googleLogoColors[colorIndex]);
          consolidatedDiscovered[i].color = this.googleLogoColors[colorIndex];
          colorIndex++;
        }
      } else {
        if (parseInt(i) == dynaLen) {
          let forSearch: any = { forSearch: [], tooltip: '' };
          this.name_data[i] = data[i].name;
          this.count_data.push(data[i].count);
          consolidatedDiscovered.push({ ...forSearch, ...data[i] });
          consolidatedDiscovered[i].name = 'All Others (' + 1 + ')';
          consolidatedDiscovered[i].tooltip = data[i].name;
          consolidatedDiscovered[i].forSearch.push(data[i].name);
          if (data[i].name.toLowerCase() == 'uncategorized') {
            this.color_data.push(this.googleRed);
            consolidatedDiscovered[i].color = this.googleRed;
          } else {
            this.color_data.push(this.googleLogoColors[colorIndex]);
            consolidatedDiscovered[i].color = this.googleLogoColors[colorIndex];
          }
        } else {
          this.count_data[dynaLen] = this.count_data[dynaLen] + data[i].count;
          this.name_data[dynaLen] = `${this.name_data[dynaLen]}, ${data[i].name}`;
          this.device_all_other_count = this.name_data[dynaLen].split(',').length;
          consolidatedDiscovered[dynaLen].name = 'All Others (' + this.device_all_other_count + ')';
          consolidatedDiscovered[dynaLen].count = consolidatedDiscovered[dynaLen].count + data[i].count;
          consolidatedDiscovered[dynaLen].forSearch.push(data[i].name);
          consolidatedDiscovered[dynaLen].tooltip = this.name_data[dynaLen];
        }
      }
    }

    var index = consolidatedDiscovered.findIndex(obj => obj.name.toLowerCase() == 'uncategorized');

    if (index != -1) {
      consolidatedDiscovered.push(consolidatedDiscovered.splice(index, 1)[0]);
    } else if (uncategorizedHolder != null) {
      consolidatedDiscovered.push(uncategorizedHolder);
      this.color_data.push(uncategorizedHolder.color);
      this.name_data.push(uncategorizedHolder.name);
      this.count_data.push(uncategorizedHolder.count);
    }

    this.dount_data = consolidatedDiscovered;
    // console.log('resultant_discovered', this.dount_data);




    this.data_dount = {
      labels: this.name_data,
      datasets: [
        {
          data: this.count_data,
          backgroundColor: this.color_data,
          hoverBackgroundColor: this.color_data,
          borderColor: '#0e1319',
          borderWidth: 3
        }
      ]
    };

    var tc = this.Total_count;
    this.options = {
      for_plugin: 'device-chart',
      elements: {
        center: {
          text: tc,
          color: '#FFFFFF',
          sidePadding: 25,
          // fontStyle: 'bold'
        }
      },
      legend: {
        display: false
      },
      cutoutPercentage: 85,
      tooltips: {
        // Disable the on-canvas tooltip
        enabled: false,

        custom: function (tooltipModel) {
          // Tooltip Element
          var tooltipEl = document.getElementById('chartjs-tooltip');

          // Create element on first render
          if (!tooltipEl) {
            tooltipEl = document.createElement('div');
            tooltipEl.id = 'chartjs-tooltip';
            tooltipEl.innerHTML = '<table></table>';
            document.body.appendChild(tooltipEl);
          }

          // Hide if no tooltip
          if (tooltipModel.opacity === 0) {
            tooltipEl.style.opacity = '0';
            return;
          }

          // Set caret Position
          tooltipEl.classList.remove('above', 'below', 'no-transform');
          if (tooltipModel.yAlign) {
            tooltipEl.classList.add(tooltipModel.yAlign);
          } else {
            tooltipEl.classList.add('no-transform');
          }

          function getBody(bodyItem) {
            return bodyItem.lines;
          }

          // Set Text
          if (tooltipModel.body) {
            var titleLines = tooltipModel.title || [];
            var bodyLines = tooltipModel.body.map(getBody);
            var innerHtml = '<thead>';

            titleLines.forEach(function (title) {
              innerHtml += '<tr><th>' + title + '</th></tr>';
            });
            innerHtml += '</thead><tbody>';

            bodyLines.forEach(function (body, i) {
              var colors = tooltipModel.labelColors[i];
              var style = 'background:' + colors.backgroundColor;
              style += '; border-color:' + colors.borderColor;
              style += '; border-width: 2px';
              var span = '<span style="' + style + '"></span>';
              innerHtml += '<tr><td>' + span + body + '</td></tr>';
            });
            innerHtml += '</tbody>';

            var tableRoot = tooltipEl.querySelector('table');
            tableRoot.innerHTML = innerHtml;
          }

          // `this` will be the overall tooltip
          var position = this._chart.canvas.getBoundingClientRect();

          // Display, position, and set styles for font
          tooltipEl.style.opacity = '1';
          tooltipEl.style.left = position.left + window.pageXOffset + tooltipModel.caretX + 'px';
          tooltipEl.style.top = position.top + window.pageYOffset + tooltipModel.caretY + 'px';
          tooltipEl.style.fontFamily = tooltipModel._bodyFontFamily;
          tooltipEl.style.fontSize = tooltipModel.bodyFontSize + 'px';
          tooltipEl.style.fontStyle = tooltipModel._bodyFontStyle;
          tooltipEl.style.padding = tooltipModel.yPadding + 'px ' + tooltipModel.xPadding + 'px';
        }
      }
    };



    if (this.div1 == undefined) {
      this.div1 = document.getElementById('text1');
      this.div1.addEventListener('click', (e: Event) => this.device_type_details('ALL', 'DISCOVERED', []));
    }

    this.chart_style(this.div1, 'device-chart');

    this.name_data = [];
    this.count_data = [];
    this.color_data = [];
  }

  chart_style(div, chartId) {
    Chart.pluginService.register({
      beforeDraw: function (chart) {
        if (chart.config.options.for_plugin == chartId) {
          let ctx = chart.chart.ctx;
          let centerConfig = chart.config.options.elements.center;
          let txt = centerConfig.text;
          let color = centerConfig.color || '#000';
          let centerX = ((chart.chartArea.left + chart.chartArea.right) / 2);
          let centerY = ((chart.chartArea.top + chart.chartArea.bottom) / 2);
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.font = '35px gilroy-regular';
          ctx.fillStyle = color;
          ctx.fillText(txt, centerX, centerY);

          var width = chart.chart.width;
          var height = chart.chart.height;
          div.style.font = '35px gilroy-regular';
          div.style.color = 'rgba(0,0,0,0)';
          div.style.userSelect = 'none';
          div.style.cursor = 'pointer';
          div.innerText = chart.options.elements.center.text;
          var r = div.getBoundingClientRect();
          div.style.left = ((width - r.width) / 2) + 7 + "px";
          div.style.top = ((height - r.height) / 2) + 5 + "px";
        }
      }
    });
  }

  public activateClass(subModule) {
    // ActivityListItem navigation toggle
    this.ActivityListItem.filter(x => (x.active = false));
    if (localStorage.getItem('activityStatus') != null) {
      const currentActivityStatus = JSON.parse(localStorage.getItem('activityStatus'));

      this.ActivityListItem.filter(x => {
        if (x.hour === currentActivityStatus) {
          x.active = true;
        }
      });
    } else {
      subModule.active = !subModule.active;
    }
  }





  dounghut_chart_vul(data) {

    this.data_dount_vul = [];
    this.name_data_vul = [];
    this.count_data_vul = [];
    this.color_data_vul = [];
    let consolidatedVulnerable: any = [];
    let colorIndex = 0;
    let uncategorizedHolder: any = null;

    data.sort(function (a, b) {
      return b.count_vul - a.count_vul;
    });

    // data.map((child, i) => {
    //   if (child.name_vul.toLowerCase() == 'uncategorized') {
    //     uncategorizedHolder = {};
    //     uncategorizedHolder = data.splice(i, 1)[0];
    //     uncategorizedHolder.color_vul = this.googleRed;
    //   }
    // });

    let dynaLen = data.length == 4 ? 4 : 3;

    for (var i in data) {
      if (parseInt(i) < dynaLen) {
        this.name_data_vul.push(data[i].name_vul);
        this.count_data_vul.push(data[i].count_vul);
        consolidatedVulnerable.push(data[i]);

        if (data[i].name_vul.toLowerCase() == 'uncategorized') {
          this.color_data_vul.push(this.googleRed);
          consolidatedVulnerable[i].color_vul = this.googleRed;
        } else {
          this.color_data_vul.push(this.googleLogoColors[colorIndex]);
          consolidatedVulnerable[i].color_vul = this.googleLogoColors[colorIndex];
          colorIndex++;
        }
      } else {
        if (parseInt(i) == dynaLen) {
          let forSearch: any = { forSearch: [], tooltip: '' };
          this.name_data_vul[i] = data[i].name_vul;
          this.count_data_vul.push(data[i].count_vul);
          consolidatedVulnerable.push({ ...forSearch, ...data[i] });
          consolidatedVulnerable[i].name_vul = 'All Others (' + 1 + ')';
          consolidatedVulnerable[i].tooltip = data[i].name_vul;
          consolidatedVulnerable[i].forSearch.push(data[i].name_vul);
          if (data[i].name_vul.toLowerCase() == 'uncategorized') {
            this.color_data_vul.push(this.googleRed);
            consolidatedVulnerable[i].color_vul = this.googleRed;
          } else {
            this.color_data_vul.push(this.googleLogoColors[colorIndex]);
            consolidatedVulnerable[i].color_vul = this.googleLogoColors[colorIndex];
          }
        } else {
          this.count_data_vul[dynaLen] = this.count_data_vul[dynaLen] + data[i].count_vul;
          this.name_data_vul[dynaLen] = `${this.name_data_vul[dynaLen]}, ${data[i].name_vul}`;
          this.device_vul_all_other_count = this.name_data_vul[dynaLen].split(',').length;
          consolidatedVulnerable[dynaLen].name_vul = 'All Others (' + this.device_vul_all_other_count + ')';
          consolidatedVulnerable[dynaLen].count_vul = consolidatedVulnerable[dynaLen].count_vul + data[i].count_vul;
          consolidatedVulnerable[dynaLen].forSearch.push(data[i].name_vul);
          consolidatedVulnerable[dynaLen].tooltip = this.name_data_vul[dynaLen];
        }
      }
    }

    // var index = consolidatedVulnerable.findIndex(
    //   obj => obj.name_vul.toLowerCase() == 'uncategorized'
    // );

    // if (index != -1) {
    //   consolidatedVulnerable.push(consolidatedVulnerable.splice(index, 1)[0]);
    // } else if (uncategorizedHolder != null) {
    //   consolidatedVulnerable.push(uncategorizedHolder);
    //   this.color_data_vul.push(uncategorizedHolder.color);
    //   this.name_data_vul.push(uncategorizedHolder.name_vul);
    //   this.count_data_vul.push(uncategorizedHolder.count_vul);
    // }

    this.dount_data_vul = consolidatedVulnerable;

    this.data_dount_vul = {
      labels: this.name_data_vul,
      datasets: [
        {
          data: this.count_data_vul,
          backgroundColor: this.color_data_vul,
          hoverBackgroundColor: this.color_data_vul,
          borderColor: '#0e1319',
          borderWidth: 3
        }
      ]
    };
    var tc_vul = this.Total_count_vulneerable;
    this.options_vul = {
      for_plugin: 'vulnerable-chart',
      elements: {
        center: {
          text: tc_vul,
          color: '#FFFFFF',
          sidePadding: 25,
          // fontStyle: 'bold'
        }
      },
      legend: {
        display: false
      },
      cutoutPercentage: 85,
      tooltips: {
        // Disable the on-canvas tooltip
        enabled: false,

        custom: function (tooltipModel) {
          // Tooltip Element
          var tooltipEl = document.getElementById('chartjs-tooltip');

          // Create element on first render
          if (!tooltipEl) {
            tooltipEl = document.createElement('div');
            tooltipEl.id = 'chartjs-tooltip';
            tooltipEl.innerHTML = '<table></table>';
            document.body.appendChild(tooltipEl);
          }

          // Hide if no tooltip
          if (tooltipModel.opacity === 0) {
            tooltipEl.style.opacity = '0';
            return;
          }

          // Set caret Position
          tooltipEl.classList.remove('above', 'below', 'no-transform');
          if (tooltipModel.yAlign) {
            tooltipEl.classList.add(tooltipModel.yAlign);
          } else {
            tooltipEl.classList.add('no-transform');
          }

          function getBody(bodyItem) {
            return bodyItem.lines;
          }

          // Set Text
          if (tooltipModel.body) {
            var titleLines = tooltipModel.title || [];
            var bodyLines = tooltipModel.body.map(getBody);
            var innerHtml = '<thead>';

            titleLines.forEach(function (title) {
              innerHtml += '<tr><th>' + title + '</th></tr>';
            });
            innerHtml += '</thead><tbody>';

            bodyLines.forEach(function (body, i) {
              var colors = tooltipModel.labelColors[i];
              var style = 'background:' + colors.backgroundColor;
              style += '; border-color:' + colors.borderColor;
              style += '; border-width: 2px';
              var span = '<span style="' + style + '"></span>';
              innerHtml += '<tr><td>' + span + body + '</td></tr>';
            });
            innerHtml += '</tbody>';

            var tableRoot = tooltipEl.querySelector('table');
            tableRoot.innerHTML = innerHtml;
          }

          // `this` will be the overall tooltip
          var position = this._chart.canvas.getBoundingClientRect();

          // Display, position, and set styles for font
          tooltipEl.style.opacity = '1';
          tooltipEl.style.left = position.left + window.pageXOffset + tooltipModel.caretX + 'px';
          tooltipEl.style.top = position.top + window.pageYOffset + tooltipModel.caretY + 'px';
          tooltipEl.style.fontFamily = tooltipModel._bodyFontFamily;
          tooltipEl.style.fontSize = tooltipModel.bodyFontSize + 'px';
          tooltipEl.style.fontStyle = tooltipModel._bodyFontStyle;
          tooltipEl.style.padding = tooltipModel.yPadding + 'px ' + tooltipModel.xPadding + 'px';
        }
      }
    };

    if (this.div2 == undefined) {
      this.div2 = document.getElementById('text2');
      this.div2.addEventListener('click', (e: Event) => this.device_type_details('ALL', 'OPERATINGSYSTEM', []));
    }

    this.chart_style(this.div2, 'vulnerable-chart');

    this.name_data_vul = [];
    this.count_data_vul = [];
    this.color_data_vul = [];
  }

  dounghut_chart_online(data) {



    this.data_dount_online = [];
    this.name_data_online = [];
    this.count_data_online = [];
    this.color_data_online = [];
    let consolidatedOnline: any = [];
    let colorIndex = 0;
    let uncategorizedHolder: any = null;

    data.sort(function (a, b) {
      return b.count_online - a.count_online;
    });

    data.map((child, i) => {
      if (child.name_online.toLowerCase() == 'uncategorized') {

        uncategorizedHolder = {};
        uncategorizedHolder = data.splice(i, 1)[0];
        uncategorizedHolder.color_online = this.googleRed;
      }
    });

    let dynaLen = data.length == 3 ? 3 : 2;

    for (var i in data) {
      if (parseInt(i) < dynaLen) {
        this.name_data_online.push(data[i].name_online);
        this.count_data_online.push(data[i].count_online);
        consolidatedOnline.push(data[i]);

        if (data[i].name_online.toLowerCase() == 'uncategorized') {
          this.color_data_online.push(this.googleRed);
          consolidatedOnline[i].color_online = this.googleRed;
        } else {
          this.color_data_online.push(this.googleLogoColors[colorIndex]);
          consolidatedOnline[i].color_online = this.googleLogoColors[colorIndex];
          colorIndex++;
        }
      } else {
        if (parseInt(i) == dynaLen) {
          let forSearch: any = { forSearch: [], tooltip: '' };
          this.name_data_online[i] = data[i].name_online;
          this.count_data_online.push(data[i].count_online);
          consolidatedOnline.push({ ...forSearch, ...data[i] });
          consolidatedOnline[i].name_online = 'All Others (' + 1 + ')';
          consolidatedOnline[i].tooltip = data[i].name_online;
          consolidatedOnline[i].forSearch.push(data[i].name_online);
          if (data[i].name_online.toLowerCase() == 'uncategorized') {
            this.color_data_online.push(this.googleRed);
            consolidatedOnline[i].color_online = this.googleRed;
          } else {
            this.color_data_online.push(this.googleLogoColors[colorIndex]);
            consolidatedOnline[i].color_online = this.googleLogoColors[colorIndex];
          }
        } else {
          this.count_data_online[dynaLen] = this.count_data_online[dynaLen] + data[i].count_online;
          this.name_data_online[dynaLen] = `${this.name_data_online[dynaLen]}, ${data[i].name_online}`;
          this.device_online_all_other_count = this.name_data_online[dynaLen].split(',').length;
          consolidatedOnline[dynaLen].name_online = 'All Others (' + this.device_online_all_other_count + ')';
          consolidatedOnline[dynaLen].count_online = consolidatedOnline[dynaLen].count_online + data[i].count_online;
          consolidatedOnline[dynaLen].forSearch.push(data[i].name_online);
          consolidatedOnline[dynaLen].tooltip = this.name_data_online[dynaLen];
        }
      }
    }

    var index = consolidatedOnline.findIndex(
      obj => obj.name_online.toLowerCase() == 'uncategorized'
    );

    if (index != -1) {
      consolidatedOnline.push(consolidatedOnline.splice(index, 1)[0]);
    } else if (uncategorizedHolder != null) {
      consolidatedOnline.push(uncategorizedHolder);
      this.color_data_online.push(uncategorizedHolder.color_online);
      this.name_data_online.push(uncategorizedHolder.name_online);
      this.count_data_online.push(uncategorizedHolder.count_online);
    }

    this.dount_data_online = consolidatedOnline;
    // console.log('resultant_online', this.dount_data_online);

    this.data_dount_online = {
      labels: this.name_data_online,
      datasets: [
        {
          data: this.count_data_online,
          backgroundColor: this.color_data_online,
          hoverBackgroundColor: this.color_data_online,
          borderColor: '#0e1319',
          borderWidth: 3
        }
      ]
    };
    var tc_online = this.Total_count_online;
    this.options_online = {
      for_plugin: 'online-chart',
      elements: {
        center: {
          text: tc_online,
          color: '#FFFFFF',
          sidePadding: 25,
          // fontStyle: 'bold'
        }
      },
      legend: {
        display: false
      },
      cutoutPercentage: 85,
      tooltips: {
        // Disable the on-canvas tooltip
        enabled: false,

        custom: function (tooltipModel) {
          // Tooltip Element
          var tooltipEl = document.getElementById('chartjs-tooltip');

          // Create element on first render
          if (!tooltipEl) {
            tooltipEl = document.createElement('div');
            tooltipEl.id = 'chartjs-tooltip';
            tooltipEl.innerHTML = '<table></table>';
            document.body.appendChild(tooltipEl);
          }

          // Hide if no tooltip
          if (tooltipModel.opacity === 0) {
            tooltipEl.style.opacity = '0';
            return;
          }

          // Set caret Position
          tooltipEl.classList.remove('above', 'below', 'no-transform');
          if (tooltipModel.yAlign) {
            tooltipEl.classList.add(tooltipModel.yAlign);
          } else {
            tooltipEl.classList.add('no-transform');
          }

          function getBody(bodyItem) {
            return bodyItem.lines;
          }

          // Set Text
          if (tooltipModel.body) {
            var titleLines = tooltipModel.title || [];
            var bodyLines = tooltipModel.body.map(getBody);
            var innerHtml = '<thead>';

            titleLines.forEach(function (title) {
              innerHtml += '<tr><th>' + title + '</th></tr>';
            });
            innerHtml += '</thead><tbody>';

            bodyLines.forEach(function (body, i) {
              var colors = tooltipModel.labelColors[i];
              var style = 'background:' + colors.backgroundColor;
              style += '; border-color:' + colors.borderColor;
              style += '; border-width: 2px';
              var span = '<span style="' + style + '"></span>';
              innerHtml += '<tr><td>' + span + body + '</td></tr>';
            });
            innerHtml += '</tbody>';

            var tableRoot = tooltipEl.querySelector('table');
            tableRoot.innerHTML = innerHtml;
          }

          // `this` will be the overall tooltip
          var position = this._chart.canvas.getBoundingClientRect();

          // Display, position, and set styles for font
          tooltipEl.style.opacity = '1';
          tooltipEl.style.left = position.left + window.pageXOffset + tooltipModel.caretX + 'px';
          tooltipEl.style.top = position.top + window.pageYOffset + tooltipModel.caretY + 'px';
          tooltipEl.style.fontFamily = tooltipModel._bodyFontFamily;
          tooltipEl.style.fontSize = tooltipModel.bodyFontSize + 'px';
          tooltipEl.style.fontStyle = tooltipModel._bodyFontStyle;
          tooltipEl.style.padding = tooltipModel.yPadding + 'px ' + tooltipModel.xPadding + 'px';
        }
      }
    };


    if (this.div3 == undefined) {
      this.div3 = document.getElementById('text3');
      this.div3.addEventListener('click', (e: Event) => this.device_type_details('ALL', 'ONLINE', []));
    }

    this.chart_style(this.div3, 'online-chart');

    this.name_data_online = [];
    this.count_data_online = [];
    this.color_data_online = [];
  }

  incident_count: any;
  dounghut_chart_inc(data) {

    this.data_dount_inc = [];
    this.name_data_inc = [];
    this.count_data_inc = [];
    this.color_data_inc = [];

    var newarr = [];
    let name = ["HIGH", "MEDIUM", "LOW"];
    for (var j in name) {
      for (var i in this.dount_data_inc) {
        if (name[j] == this.dount_data_inc[i].name_inc) {
          newarr.push(this.dount_data_inc[i]);
        }
      }
    }

    this.dount_data_inc = newarr;

    var color = [{ "color_inc": "#df5b53" }, { "color_inc": "#d28c3c" }, { "color_inc": "#fdfe6b" }]
    var data = this.dount_data_inc.map((item, i) => Object.assign({}, item, color[i]));

    for (var i in data) {
      this.name_data_inc.push(data[i].name_inc)
      this.color_data_inc.push(data[i].color_inc)
      this.count_data_inc.push(data[i].count_inc)
    }
    this.dount_data_inc = data;


    this.data_dount_inc = {
      labels: this.name_data_inc,
      datasets: [
        {
          data: this.count_data_inc,
          backgroundColor: this.color_data_inc,
          hoverBackgroundColor: this.color_data_inc,
          borderColor: '#0e1319',
          borderWidth: 3
        }
      ]
    };
    if (this.Total_count_incidents == 0) {
      this.incident_count = '';
    } else {
      this.incident_count = this.Total_count_incidents;
    }
    //  var incident = this.Total_count_incidents;
    this.options_inc = {
      for_plugin: 'incidents-chart',
      elements: {
        center: {
          text: this.incident_count,
          color: '#FFFFFF',
          sidePadding: 25,
          // fontStyle: 'bold'
        }
      },
      legend: {
        display: false
      },
      cutoutPercentage: 85,
      tooltips: {
        // Disable the on-canvas tooltip
        enabled: false,

        custom: function (tooltipModel) {
          // Tooltip Element
          var tooltipEl = document.getElementById('chartjs-tooltip');

          // Create element on first render
          if (!tooltipEl) {
            tooltipEl = document.createElement('div');
            tooltipEl.id = 'chartjs-tooltip';
            tooltipEl.innerHTML = '<table></table>';
            document.body.appendChild(tooltipEl);
          }

          // Hide if no tooltip
          if (tooltipModel.opacity === 0) {
            tooltipEl.style.opacity = '0';
            return;
          }

          // Set caret Position
          tooltipEl.classList.remove('above', 'below', 'no-transform');
          if (tooltipModel.yAlign) {
            tooltipEl.classList.add(tooltipModel.yAlign);
          } else {
            tooltipEl.classList.add('no-transform');
          }

          function getBody(bodyItem) {
            return bodyItem.lines;
          }

          // Set Text
          if (tooltipModel.body) {
            var titleLines = tooltipModel.title || [];
            var bodyLines = tooltipModel.body.map(getBody);
            var innerHtml = '<thead>';

            titleLines.forEach(function (title) {
              innerHtml += '<tr><th>' + title + '</th></tr>';
            });
            innerHtml += '</thead><tbody>';

            bodyLines.forEach(function (body, i) {
              var colors = tooltipModel.labelColors[i];
              var style = 'background:' + colors.backgroundColor;
              style += '; border-color:' + colors.borderColor;
              style += '; border-width: 2px';
              var span = '<span style="' + style + '"></span>';
              innerHtml += '<tr><td>' + span + body + '</td></tr>';
            });
            innerHtml += '</tbody>';

            var tableRoot = tooltipEl.querySelector('table');
            tableRoot.innerHTML = innerHtml;
          }

          // `this` will be the overall tooltip
          var position = this._chart.canvas.getBoundingClientRect();

          // Display, position, and set styles for font
          tooltipEl.style.opacity = '1';
          tooltipEl.style.left = position.left + window.pageXOffset + tooltipModel.caretX + 'px';
          tooltipEl.style.top = position.top + window.pageYOffset + tooltipModel.caretY + 'px';
          tooltipEl.style.fontFamily = tooltipModel._bodyFontFamily;
          tooltipEl.style.fontSize = tooltipModel.bodyFontSize + 'px';
          tooltipEl.style.fontStyle = tooltipModel._bodyFontStyle;
          tooltipEl.style.padding = tooltipModel.yPadding + 'px ' + tooltipModel.xPadding + 'px';
        }
      }
    };


    if (this.div4 == undefined) {
      this.div4 = document.getElementById('text4');
      this.div4.addEventListener('click', (e: Event) => this.vulnerableSearch('ALL', 'INCIDENT'));
    }

    this.chart_style(this.div4, 'incidents-chart');

    this.name_data_inc = [];
    this.count_data_inc = [];
    this.color_data_inc = [];
  }




  public line_chart(value, low, medium, high) {
    this.maxvalue_result = 0;
    this.minvalue_result = 0;
    this.final_maxvalue = [];
    this.final_minvalue = [];

    let maxvalue_low = Math.max.apply(null, low);
    let minvalue_low = Math.min.apply(null, low);
    this.final_maxvalue.push(maxvalue_low);
    this.final_minvalue.push(minvalue_low);

    let maxvalue_medium = Math.max.apply(null, medium);
    let minvalue_medium = Math.min.apply(null, medium);
    this.final_maxvalue.push(maxvalue_medium);
    this.final_minvalue.push(minvalue_medium);

    let maxvalue_high = Math.max.apply(null, high);
    let minvalue_high = Math.min.apply(null, high);
    this.final_maxvalue.push(maxvalue_high);
    this.final_minvalue.push(minvalue_high);

    this.maxvalue_result = Math.max.apply(null, this.final_maxvalue);
    this.minvalue_result = Math.min.apply(null, this.final_minvalue);

    this.data = {
      labels: value,
      datasets: [
        {
          label: 'LOW',
          data: low,
          fill: false,
          backgroundColor: this.colors['low'],
          borderColor: this.colors['low'],
          pointRadius: 0
        },
        {
          label: 'MEDIUM',
          data: medium,
          fill: false,
          backgroundColor: this.colors['medium'],
          borderColor: this.colors['medium'],
          pointRadius: 0
        },
        {
          label: 'HIGH',
          data: high,
          fill: false,
          backgroundColor: this.colors['high'],
          borderColor: this.colors['high'],
          pointRadius: 0
        }
      ]
    };

    this.lineoptions = {
      legend: {
        display: false,
        labels: {
          boxWidth: 10
        }
      },

      layout: {
        padding: {
          left: 0,
          right: 0,
          top: 5,
          bottom: 5
        }
      },

      maintainAspectRatio: false,

      scales: {
        yAxes: [
          {
            ticks: {
              display: false,
              stepSize: this.maxvalue_result / 4,
              max: this.maxvalue_result == 0 ? 1 : this.maxvalue_result
            },
            gridLines: {
              color: '#646869',
              drawTicks: false,
              drawBorder: false,
              zeroLineColor: '#646869'
            }
          }
        ],
        xAxes: [
          {
            ticks: {
              display: false,
              // maxRotation: 90,
              // minRotation: 90
            },
            gridLines: {
              display: false
            }
          }
        ]
      },
      tooltips: {
        intersect: false,
        xPadding: 10
      }

    };

    this.lineChart.options = this.lineoptions;
    this.lineChart.data.labels = this.data.labels;
    this.lineChart.data.datasets = this.data.datasets;
    this.lineChart.update();

    //this.bindCustomClicks();
  }

  /**
   * Fn ActivityDeviceT Line
   */
  public FnActivityDeviceTLine(activityFilteritem: any) {
    // console.log(' clicked : ' + activityFilteritem);
    localStorage.setItem('activityStatus', activityFilteritem);
    this.IsActivityTimelineLoading = true;

    let parameter = {
      token: localStorage.getItem('token'),
      customer_id: parseInt(localStorage.getItem('customer_id_host')),
      reqId: 1,
      lastHrs: activityFilteritem
    };
    this.connectionHandler.subscribeConnection('setdashboard', parameter);
  }

  clickEvent() {
    this.status = !this.status;
  }

  public ngOnDestroy() {
    document.getElementById('dashboard-height-fix').style.height = '70%';
    this.connectionHandlerCallback.unsubscribe();
    this.dashBoardConnection.unsubscribe();
    this.devInfo.unsubscribe();
    this.IntercommunicationService.setmapMarkerRemoveEvent(null);
    this.dropDownChangeEvent.unsubscribe();

    document.getElementById('chartjs-tooltip').style.opacity = '0';

    if (this.devDataIntervalTimer) {
      clearInterval(this.devDataIntervalTimer);
    }
  }


}
