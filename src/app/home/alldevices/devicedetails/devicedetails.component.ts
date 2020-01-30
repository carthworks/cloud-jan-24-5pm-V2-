import { Component, OnInit, OnDestroy, HostListener, ViewChild, ElementRef } from '@angular/core';
import { UnityService } from '../services/UnityService.service';
import { MapGL } from '../../webgl/services/mapgl.service';
import { Node, bytesTransfered } from '../../models/node';
import { Subscription } from 'rxjs';
import { SocketdataService } from 'src/app/services/socketdata.service';
import { CameracontrollerService } from '../../webgl/services/cameracontroller.service';
import { FormsModule, FormGroup, FormBuilder, Validators } from '@angular/forms';
import { IntercommunicationService } from 'src/app/services/intercommunication.service';
import { List } from 'linqts';
import { ToastrService } from 'ngx-toastr';
import * as moment from 'moment';

import { FormControl } from '@angular/forms';
import { Observable } from 'rxjs';
import { map, startWith } from 'rxjs/operators';

import { RestserviceService } from 'src/app/services/restservice.service';
import { TextureID } from '../../models/TextureID';
import { SelectItem } from 'primeng/api';

export interface User {
  name: string;
}

@Component({
  selector: 'app-devicedetails',
  templateUrl: './devicedetails.component.html',
  styleUrls: ['./devicedetails.component.css'],
  host: {
    '(window:resize)': 'onWindowResizeEvent($event)'
  }
})
export class DevicedetailsComponent implements OnInit, OnDestroy {
  deviceCommunicationLength: number;
  devicecommdata: any;

  @HostListener('window:orientationchange', ['$event'])
  onOrientationChange(event) {
    setTimeout(() => {
      window.dispatchEvent(new Event('resize'));
    }, 1000);
  }

  popupLoading: boolean = true;
  sliderData: any = {
    0: {
      name: 'Attack',
      data: [],
      count: 0,
      availableCount: 0,
      currentSlideNo: -1,
      timestamp: 0,
      start: 0,
      length: 10,
      holdableSize: 30,
      floatingIndex: 0,
      isNoData: false,
      currentSlide: {
        baseScore: 0,
        cve_desc: '',
        cve_id: ''
      }
    },
    1: {
      name: 'Application',
      data: [],
      count: 0,
      availableCount: 0,
      currentSlideNo: -1,
      start: 0,
      length: 10,
      holdableSize: 30,
      floatingIndex: 0,
      isNoData: false,
      currentSlide: {
        baseScore: 0,
        cve_desc: '',
        cve_id: ''
      }
    },
    2: {
      name: 'OS',
      data: [],
      count: 0,
      availableCount: 0,
      currentSlideNo: -1,
      start: 0,
      length: 10,
      holdableSize: 30,
      floatingIndex: 0,
      isNoData: false,
      currentSlide: {
        baseScore: 0,
        cve_desc: '',
        cve_id: ''
      }
    },
    totalIncidentsCount: 0,
    incidentType: 0
  };

  incidentTypes: SelectItem[] = [
    { label: 'Attack', value: 0 },
    { label: 'Application', value: 1 },
    { label: 'OS', value: 2 }
  ];

  attackSubcategory: any = {
    'NETWORK_SERVICE_SCANNING': 'Network Service Scanning',
    'SSH_BRUTEFORCE': 'SSH Bruteforce',
    'SMB_BRUTEFORCE': 'SMB Bruteforce',
    'TEAMVIEWER': 'Teamviewer',
    'SPEARPHISHING_LINK': 'Spearphishing Link',
    'WANNACRY_RANSOMWARE': 'WannaCry Ransomware',
    'CERBER_RANSOMWARE_RAAS': 'Cerber Ransomware',
    'TRACEROUTE': 'Traceroute',
    'TRACERT': 'Tracert',
    'PING_SWEEP': 'Ping Sweep',
    'FTP_BRUTEFORCE': 'FTP Bruteforcing',
    'MYSQL_BRUTEFORCE': 'MYSQL Bruteforce',
    'TELNET_BRUTEFORCE': 'TELNET Bruteforcing',
    'MIRAI_BOTNET': 'Mirai Botnet'
  }

  public DeviceCommCount: {
    total: number;
    internalIP: number;
    externalIP: number;
    blacklistedIP: number;
  };

  showUncategorizedException: boolean = false;

  public deviceCommuniLoading = false;
  public isDeviceCommActive = true;
  public isDeviceCommExternalActive = false;
  public isDeviceCommInternalActive = false;
  public isDeviceCommBlockedActive = false;

  // tslint:disable-next-line: max-line-length
  public communicatedDeviceChart: {};
  private textureID = new TextureID();
  private img_src = new Device_SRC_ID();
  private frameUpdate: boolean = false;
  private selectedNode: Node;
  private connectedDevice: Subscription = null;
  private mouseEvent: Subscription = null;
  public innerWidth: any;
  public innerHeight: any;
  public isCommunicatedDeviceChartAvail = false;
  ActivityLineOptions: any;
  public isUserListNull: boolean;
  userNameCollections: any = [];
  UserDetailsObj: any;
  ImgPath = '/assets/device_type/';
  usertitle: any;
  ApplicationData: {};
  PortData: any;
  ApplicationDataOptions: any;
  PortOptions: any;
  ActivityLineChart: any;
  current_customer_id: string;
  requestNodeDetailsForModel: any;
  modelData: any = {};
  payloadmData: any;

  RowClickedState: any;
  editMode = false;
  editModem = false;
  public dataAvailStatus = 'No data available';
  isDeviceCommunicationDataAvail: boolean;
  public isDeviceCommunidationLoading = false;

  communicatedDeviceChartOptions: {};

  isFirstItemOfTheList: boolean;
  public UserDetailsCollections = [];
  selectedDevice = {};

  public domainAccessed: any = [];
  public applicationInfoAccessed: any = [];
  public modelData_new: any = [];
  public modalDeviceDetailsInfo: any = {
    mac: '',
    ip: '',
    host_name: '',
    collector: '',
    devtype: '',
    manufacture: '',
    version: '',
    model: '',
    osname: ''
  };

  connectionType: any = {};
  isConnectionTypeAvail: boolean;
  protocolArray: any = [];
  protocolLabel: any = [];
  protocolBgColor: any = [];
  portBgArray: any = [];

  portBgColor: any;
  ActivityLineChartData: number[];
  ActivityLineChartLabel: any[];
  isServiceNameListNull: boolean;
  bytesTransfered: any;
  cLabel: any[];
  cData: any[];
  cColour = [];
  cIP: any;
  deviceImageIs: any;
  ArrTunnel: any[] = [];

  userinfo_nodata: any;
  otherinfo_nodata: any;
  isApplicationData: boolean = false;
  application_chart: any;
  port_chart: any;
  isPortData: boolean = false;
  isActivityLineChartData: boolean = false;

  editMode1: boolean = false;
  editMode2: boolean = false;
  editMode3: boolean = false;
  editMode4: boolean = false;
  editMode5: boolean = false;
  editMode6: boolean = false;
  editMode7: boolean = false;
  crowdSourcingConn: any;
  filteredcLabel: any[];
  getOnlyValidLabels: any[];
  cLabelChildren: string[];
  fArrLabel: any;

  domainAccessedCollections = [];


  arrService: any[] = [];
  DeviceDetailsPortLabels: any = [];
  LastActivityDate: String;
  DeviceDetailsApplicationProtocols: any = [];
  DArray: any[] = [];
  public communicatedDeviceNoData: boolean = false;
  isMapGlAvailable: boolean = false;
  @HostListener('window:resize', ['$event'])
  onResize(event) {
    this.innerWidth = window.innerWidth;
    this.innerHeight = window.innerHeight;
    if (this.isMapGlAvailable) {
      document.getElementById('communicated-device').style.width = '100%';
      this.mapGL.WindowResize(event);
    }

  }

  myControl = new FormControl();
  options: any = [];
  filteredOptions: Observable<string[]>;

  myControl1 = new FormControl();
  options1: any = [];
  filteredOptions1: Observable<string[]>;

  myControl2 = new FormControl();
  options2: any = [];
  filteredOptions2: Observable<string[]>;

  DeviceDetailsPort: any = [];
  DeviceDetailsServiceName: any = [];
  DeviceDetailstunnelPortocol: any = [];

  /* Device details edit related start*/
  hostNameFieldHolder: string = '';
  hostNameFieldToggler: boolean = false;
  deviceTypeHolder: string = '';
  deviceTypeToggler: boolean = false;
  deviceTypeOptions: any[] = [];
  manufacturerHolder: string = '';
  manufacturerToggler: boolean = false;
  manufacturerOptions: any[] = [];
  modelHolder: string = '';
  modelToggler: boolean = false;
  modelOptions: any[] = [];
  osFieldHolder: string = '';
  osFieldToggler: boolean = false;
  versionFieldHolder: string = '';
  versionFieldToggler: boolean = false;
  @ViewChild('hostname') hostNameElement: ElementRef;
  @ViewChild('version') versionElement: ElementRef;
  @ViewChild('os') osElement: ElementRef;
  deviceDetailsForm: FormGroup;
  request_result: any;
  isIncidentTabFirst: boolean = true;
  /* Device details edit related end */
  gotInitialData: boolean = false;

  ssidInfo: any = { isAP: false, apInfo: [], ifSingle: '-' };
  constructor(
    private formBuilder: FormBuilder,
    private intercommunicationservice: IntercommunicationService,
    private cameraController: CameracontrollerService,
    private socket: SocketdataService,
    public mapGL: MapGL,
    public unityService: UnityService,
    public toaster: ToastrService,
    private restService: RestserviceService
  ) {

    this.request_result = JSON.parse(localStorage.getItem('mData'))
    this.isIncidentTabFirst = this.request_result['isIncidentTabFirst'];
    if (this.isIncidentTabFirst) {
      this.tab_first(this.request_result, 3)
    } else {
      this.tab_first(this.request_result, 2)
    }
    this.innerWidth = window.innerWidth;
    this.innerHeight = window.innerHeight;

    this.options = JSON.parse(localStorage.getItem('devicetype'));
    this.options1 = JSON.parse(localStorage.getItem('manufacturer'));
    this.options2 = JSON.parse(localStorage.getItem('modelno'));

    /* Device detail edit form */
    this.deviceDetailsForm = this.formBuilder.group({
      hostName: [
        '',
        [
          Validators.pattern(
            '^[a-zA-Z0-9-]*$'
          )
        ]
      ],
      deviceType: ['', [Validators.pattern('^[a-zA-Z ]*$')]],
      manufacturer: ['', [Validators.pattern('^[a-zA-Z0-9-()+*?&., ]*$')]],
      model: ['', [Validators.pattern('^[a-zA-Z0-9-().+/, ]*$')]],
      os: ['', [Validators.pattern('^[a-zA-Z0-9-]*$')]],
      version: ['', [Validators.pattern('^[a-zA-Z0-9.]*$')]]
    });

    this.communicatedDeviceChartOptions = {
      responsive: true,
      maintainAspectRatio: false,
      title: {
        display: false,
        text: 'communicatedDevice',
        fontSize: 16
      },
      legend: {
        position: 'bottom',
        display: true
      },
      segmentShowStroke: false
    };
  }

  tab_first(val, param_id) {
    this.popupLoading = true;
    // to close loader
    setTimeout(() => {
      this.popupLoading = false
    }, 10000);
    var deviceObj = {};
    deviceObj['mac_address'] = val.mac_address;
    deviceObj['ip_address'] = val.ip_address;
    deviceObj['master_id'] = val.master_id;
    deviceObj['license_key'] = val.license_key;
    deviceObj['param'] = param_id;

    if (param_id == 3) {
      deviceObj['start'] = this.sliderData[this.sliderData.incidentType].start;
      deviceObj['length'] = this.sliderData[this.sliderData.incidentType].length;
      deviceObj['type'] = this.sliderData.incidentType;
      if (this.sliderData.incidentType == 0) {
        deviceObj['timestamp'] = this.sliderData[this.sliderData.incidentType].timestamp;
      }
    }

    // this.isDeviceCommActive = false;
    // this.isDeviceCommExternalActive = false;
    // this.isDeviceCommInternalActive = false;
    // this.isDeviceCommBlockedActive = false;

    this.socket.requestNodeDetails(deviceObj);
  }

  handleChange(e) {
    this.isMapGlAvailable = false;
    var index = e.index;
    this.request_result = JSON.parse(localStorage.getItem('mData'))

    if (index == 0) { // incident
      if (this.sliderData.totalIncidentsCount == 0) {
        this.tab_first(this.request_result, 3);
      }
    } else if (index == 1) { // device
      this.tab_first(this.request_result, 2)
    } else if (index == 2) { // port 
      this.tab_first(this.request_result, 4)
    } else if (index == 3) { // user info
      this.tab_first(this.request_result, 8)
    } else if (index == 4) { //domain
      this.tab_first(this.request_result, 5)
    } else if (index == 5) { // application
      this.tab_first(this.request_result, 9)
    }
    // else if (index == 5) { //tunnel
    //   this.tab_first(this.request_result, 6)
    // }
    // else if (index == 6) { //service
    //   this.tab_first(this.request_result, 7)
    // } 
  }

  onScroll() {
    let tooltip = document.getElementById('ai3-dc-tooltip');
    tooltip.style.display = 'none';
  }

  ngAfterViewInit() {
    let tooltip = document.createElement('div');
    tooltip.setAttribute('id', 'ai3-dc-tooltip');
    document.body.appendChild(tooltip);

    window.addEventListener('scroll', this.onScroll, true);
  }

  /* Device type autocomplete */
  filterDeviceTypes(event) {
    this.showUncategorizedException = false;
    let query = event.query;
    this.deviceTypeOptions = this.filterDevices(query, this.options);
  }

  filterDevices(query, types: any[]): any[] {
    let filtered: any[] = [];
    types = types != null && types != undefined ? types : [];
    for (let i = 0; i < types.length; i++) {
      let type = types[i];
      if (type.toLowerCase().indexOf(query.toLowerCase()) == 0) {
        filtered.push(type);
      }
    }
    return filtered;
  }

  /* Manufacturers autocomplete */
  filterManufacturerTypes(event) {
    let query = event.query;
    this.manufacturerOptions = this.filterManufacturer(query, this.options1);
  }

  filterManufacturer(query, types: any[]): any[] {
    let filtered: any[] = [];
    types = types != null && types != undefined ? types : [];
    for (let i = 0; i < types.length; i++) {
      let type = types[i];
      if (type.toLowerCase().indexOf(query.toLowerCase()) == 0) {
        filtered.push(type);
      }
    }
    return filtered;
  }

  /* Model type autocomplete */
  filterModelTypes(event) {
    let query = event.query;
    this.modelOptions = this.filterModel(query, this.options2);
  }

  filterModel(query, types: any[]): any[] {
    let filtered: any[] = [];
    types = types != null && types != undefined ? types : [];
    for (let i = 0; i < types.length; i++) {
      let type = types[i];
      if (type.toLowerCase().indexOf(query.toLowerCase()) == 0) {
        filtered.push(type);
      }
    }
    return filtered;
  }

  /* For device details validation */
  get ddControls() {
    return this.deviceDetailsForm.controls;
  }

  ngOnInit() {
    this.DeviceCommCount = { total: 0, internalIP: 0, externalIP: 0, blacklistedIP: 0 }; // initization

    this.filteredOptions = this.myControl.valueChanges.pipe(
      startWith(''),
      map(value => this._filter(value))
    );

    this.filteredOptions1 = this.myControl1.valueChanges.pipe(
      startWith(''),
      map(value1 => this._filter1(value1))
    );

    this.filteredOptions2 = this.myControl2.valueChanges.pipe(
      startWith(''),
      map(value2 => this._filter2(value2))
    );

    // tslint:disable-next-line: no-unused-expression
    this.selectedNode; // Get SelectedNode;
    this.crowdSourcingConn = this.socket.getcrowdSourcing().subscribe(info => {
      if (info) {
        this.toaster.info('Crowd sourcing data updated', 'Success');
        this.intercommunicationservice.SetDeviceDetailsPopup(true);
      } else {
        this.toaster.error('Crowd sourcing update failed ', 'Info');
      }
    });

    this.current_customer_id = localStorage.getItem('setting_customer_id');

    let app_protocol = {
      '1': 'ICMP',
      '6': 'TCP',
      '17': 'UDP',
      '1001': 'STP',
      '1002': 'ARP',
      '1003': 'HTTP',
      '1004': 'HTTP REQUEST',
      '1005': 'HTTP RESPONSE',
      '1006': 'SSL',
      '1007': 'DHCP',
      '1008': 'DNS',
      '1009': 'FTP',
      '1010': 'SSH',
      '1011': 'DICOM',
      '1012': 'HL7',
      '1013': 'SSDP',
      '1014': 'UPNP',
      '1015': 'SNMP',
      '1016': 'MDNS'
    };
    this.ApplicationDataOptions = {
      responsive: true,
      maintainAspectRatio: false,
      title: {
        display: false,
        text: 'Application Data',
        fontSize: 16
      },
      legend: {
        position: 'bottom',
        display: false
      },
      segmentShowStroke: false,
      tooltips: {
        displayColors: false,
        enabled: true,
        mode: 'single',
        callbacks: {
          label: function (t, d) {
            return d['labels'][t.index];
          },
          // remove title
          title: function (tooltipItem, data) {
            return;
          }
        }
      }
    };

    this.PortOptions = {
      responsive: true,
      maintainAspectRatio: false,
      title: {
        display: false,
        text: 'Port Data',
        fontSize: 16
      },
      legend: {
        position: 'bottom',
        display: false
      },
      segmentShowStroke: false,
      tooltips: {
        displayColors: false,
        enabled: true,
        mode: 'single',
        callbacks: {
          label: function (t, d) {
            return d['labels'][t.index];
          },
          // remove title
          title: function (t, d) {
            return;
          }
        }
      }
    };
    this.requestNodeDetailsForModel = this.socket.getNodeDetails().subscribe((data: any) => {
      if (!this.isEmpty(data)) {

        if (data.param == 1) { // basic info
          let deviceInfo = data;

          if (deviceInfo.hasOwnProperty('apInfo') && !this.isEmpty(data['apInfo'])) {
            let apInfo = [];

            Object.entries(deviceInfo['apInfo']).forEach(([key, value]) => {
              let iteratableValue: any = value;
              let temp: any = {
                childs: []
              }
              temp['name'] = key;
              iteratableValue.map(ap => {
                temp['childs'].push(ap);
              });
              apInfo.push(temp);
            });

            if (deviceInfo['dev_type'].toLowerCase() == 'access point') {
              this.ssidInfo.isAP = true;
            }

            this.ssidInfo['apInfo'] = apInfo;
            this.ssidInfo['ifSingle'] = apInfo[0]['childs'][0];
          }

          this.modalDeviceDetailsInfo.host_name = deviceInfo.hasOwnProperty('host_name')
            ? deviceInfo['host_name']
            : '';
          this.modalDeviceDetailsInfo.manufacture = deviceInfo.hasOwnProperty('m_name')
            ? deviceInfo['m_name']
            : '';

          /* Initialize form controls of device details */
          this.deviceDetailsForm.controls['hostName'].setValue(
            deviceInfo.hasOwnProperty('host_name') ? deviceInfo['host_name'] : ''
          );
          this.deviceDetailsForm.controls['manufacturer'].setValue(
            deviceInfo.hasOwnProperty('m_name') ? deviceInfo['m_name'] : ''
          );
          this.deviceDetailsForm.controls['deviceType'].setValue(
            deviceInfo.hasOwnProperty('dev_type') ? deviceInfo['dev_type'] : ''
          );
          this.deviceDetailsForm.controls['os'].setValue(
            deviceInfo.hasOwnProperty('os_name') ? deviceInfo['os_name'] : ''
          );
          this.deviceDetailsForm.controls['version'].setValue(
            deviceInfo.hasOwnProperty('version') ? deviceInfo['version'] : ''
          );
          this.deviceDetailsForm.controls['model'].setValue(
            deviceInfo.hasOwnProperty('m_model') ? deviceInfo['m_model'] : ''
          );

          this.modalDeviceDetailsInfo.manufacture = deviceInfo.hasOwnProperty('m_name')
            ? deviceInfo['m_name']
            : '';

          this.myControl1.setValue(this.modalDeviceDetailsInfo.manufacture);

          this.modalDeviceDetailsInfo.devtype = deviceInfo.hasOwnProperty('dev_type')
            ? deviceInfo['dev_type']
            : '';

          this.DeviceTypeImageSet(this.modalDeviceDetailsInfo.devtype);

          this.myControl.setValue(this.modalDeviceDetailsInfo.devtype);

          this.modalDeviceDetailsInfo.ip = deviceInfo.hasOwnProperty('ipaddress')
            ? deviceInfo['ipaddress']
            : '';
          this.modalDeviceDetailsInfo.osname = deviceInfo.hasOwnProperty('os_name')
            ? deviceInfo['os_name']
            : '';
          this.modalDeviceDetailsInfo.mac = deviceInfo.hasOwnProperty('mac_address')
            ? deviceInfo['mac_address']
            : '';

          this.modalDeviceDetailsInfo.master_id = deviceInfo.hasOwnProperty('master_id')
            ? deviceInfo['master_id']
            : '';

          this.modalDeviceDetailsInfo.version = deviceInfo.hasOwnProperty('version')
            ? deviceInfo['version']
            : '';
          this.modalDeviceDetailsInfo.model = deviceInfo.hasOwnProperty('m_model')
            ? deviceInfo['m_model']
            : '';

          this.myControl2.setValue(this.modalDeviceDetailsInfo.model);

          this.modalDeviceDetailsInfo.desc = deviceInfo.hasOwnProperty('desc') ? deviceInfo['desc'] : '';
          this.modalDeviceDetailsInfo.collector = deviceInfo.hasOwnProperty('license_key')
            ? deviceInfo['license_key']
            : '';
        } else if (data.param == 2) {
          // device
          this.isMapGlAvailable = true;
          this.devicecommdata = data;
          this.DeviceCommCount.total = data.count.totaldevicecount;
          this.DeviceCommCount.internalIP = data.count.internalipcount;
          this.DeviceCommCount.externalIP = data.count.externalipcount;
          this.DeviceCommCount.blacklistedIP = data.count.blacklistedIPcount;

          if (this.mapGL.scene == null || this.mapGL.scene == undefined) {
            this.mapGL.InitGl('communicated-device');
            this.mapGL.SwitchtoPopUp();
            this.frameUpdate = true;
            this.Animate();

            this.mouseEvent = this.cameraController.GetMouseEvent().subscribe(info => {
              let e: any = info;
              if (e.type == 'click') {
                if (e.event.type === 'touch') {
                  this.showTooltip(e);
                }
              }
              if (e.type === 'clickend') {
                this.isCommunicatedDeviceChartAvail = false;
                this.communicatedDeviceNoData = false;
                if (e.event.type === 'touch') {
                  this.hideTooltip();
                }
              }
              if (e.type === 'hover') {
                this.showTooltip(e);
              }
              if (e.type === 'hoverend') {
                this.hideTooltip();
              }
            });
          }
          if (localStorage.getItem('deviceCommStatus') != null) {
            const currentdeviceCommStatus = localStorage.getItem('deviceCommStatus');
            //let deviceCommItem = currentdeviceCommStatus;

            if (currentdeviceCommStatus === 'internalIP') {
              this.isDeviceCommActive = false;
              this.isDeviceCommExternalActive = false;
              this.isDeviceCommInternalActive = true;
              this.isDeviceCommBlockedActive = false;
              this.populateNodeInCanvas(this.devicecommdata, 'internalIP'); // show internalIP nodes alone
            } else if (currentdeviceCommStatus === 'externalIP') {
              this.isDeviceCommActive = false;
              this.isDeviceCommExternalActive = true;
              this.isDeviceCommInternalActive = false;
              this.isDeviceCommBlockedActive = false;
              this.populateNodeInCanvas(this.devicecommdata, 'externalIP'); // show externalIP nodes only
            } else if (currentdeviceCommStatus === 'all') {
              this.isDeviceCommActive = true;
              this.isDeviceCommExternalActive = false;
              this.isDeviceCommInternalActive = false;
              this.isDeviceCommBlockedActive = false;
              this.populateNodeInCanvas(this.devicecommdata, 'all'); // show all node with various node with color
            } else if (currentdeviceCommStatus === 'blacklistedIP') {
              this.isDeviceCommActive = false;
              this.isDeviceCommExternalActive = false;
              this.isDeviceCommInternalActive = false;
              this.isDeviceCommBlockedActive = true;
              this.populateNodeInCanvas(this.devicecommdata, 'blacklistedIP'); // show blocked ones
            }

            // isDeviceCommInternalActive
            //
          } else {
            this.isDeviceCommActive = true;
            this.isDeviceCommExternalActive = false;
            this.isDeviceCommInternalActive = false;
            this.isDeviceCommBlockedActive = false;
            this.populateNodeInCanvas(data, 'all');
          }
          this.popupLoading = false;
          //this.populateNodeInCanvas(data, 'all');
        } else if (data.param == 3) {
          // incident
          if (data.hasOwnProperty('incidents')) {
            if (data['totIncidents'] == 0) {
              this.dataAvailStatus = 'No data available';
              this.gotInitialData = true;
            } else {
              this.sliderData.totalIncidentsCount = data['totIncidents'];
              this.sliderData[data['type']].count = data['count'];
              if (data['incidents'].length != 0) {
                this.gotInitialData = true;
                if (data['type'] == 0) {
                  data['incidents'].map(attackerInfo => {
                    if (attackerInfo.attack_subcategory == undefined) {
                      attackerInfo.attack_subcategory = "";
                    }
                    this.sliderData[data['type']].availableCount++;
                    this.sliderData[data['type']].data.push({
                      baseScore: null,
                      cve_desc: `${attackerInfo.attack_category.toUpperCase()}${attackerInfo.attack_subcategory != "" ? ' - ' + this.prepareAttackSubcategory(attackerInfo.attack_subcategory) : ''} attack, detected from the IP - ${attackerInfo.attacker_ip}  ${attackerInfo.victim_ip != '' ? 'to the IP - ' + attackerInfo.victim_ip : ''}  at ${moment.unix(attackerInfo.timestamp).format('MMMM Do YYYY h:mm:ss a')}`,
                      cve_id: null,
                      timestamp: attackerInfo.timestamp,
                      master_id: this.modalDeviceDetailsInfo.master_id,
                      license_key: attackerInfo.license_key
                    })
                  })
                } else {
                  data['incidents'].map(incident => {
                    this.sliderData[data['type']].availableCount++;
                    this.sliderData[data['type']].data.push(incident)
                  })
                }

                // if (this.sliderData[this.sliderData.incidentType].data.length >= this.sliderData[this.sliderData.incidentType].holdableSize) {
                //   console.log("rech", this.sliderData[this.sliderData.incidentType].data.length);
                //   this.sliderData[this.sliderData.incidentType].data.splice(0, 10);
                //   console.log(this.sliderData[this.sliderData.incidentType].data);
                //   this.sliderData[this.sliderData.incidentType].floatingIndex = this.sliderData[this.sliderData.incidentType].floatingIndex + 10;
                // }
                this.sliderData[data['type']].currentSlideNo++;
                this.computeCurrentSlide(this.sliderData[data['type']].currentSlideNo);
                // debugger
              } else {
                this.sliderData[data['type']].isNoData = true;
                if (data['type'] < 2 && !this.gotInitialData) {
                  this.sliderData['incidentType'] = data['type'] + 1;
                  this.tab_first(this.request_result, 3);
                }
              }
            }
          }
          this.popupLoading = false;
        } else if (data.param == 4) {  // port 

          this.portPiechart(data);

        } else if (data.param == 5) { // domain
          this.domainAccessed = [];
          if (data.hasOwnProperty('domainAccessed') && data['domainAccessed'].length !== 0) {
            for (let i = 0; i < data['domainAccessed'].length; i++) {
              this.domainAccessed.push({
                name: data['domainAccessed'][i].domain_name,
                status: data['domainAccessed'][i].rogue
              });
            }
          } else {
            this.dataAvailStatus = 'No data available';
          }
          this.popupLoading = false;

        } else if (data.param == 6) { // tunnel
          if (data.hasOwnProperty('tunnelProtocol') && data['tunnelProtocol'].length !== 0) {
            this.DArray = [];
            let arrtunnelPortocol: any[] = data['tunnelProtocol'];

            for (var j = 0; j < arrtunnelPortocol.length; j++) {
              this.DArray.push(arrtunnelPortocol[j].protocol_type.toUpperCase());
            }
            this.DeviceDetailstunnelPortocol = this.DArray.filter(function (elem, index, self) {
              return index === self.indexOf(elem);
            });
          } else {
            this.dataAvailStatus = 'No data available';
          }
          this.popupLoading = false;

        } else if (data.param == 7) { // service

          if (data.hasOwnProperty('service') && data['service'].length !== 0) {
            this.arrService = [];
            const arrServiceName = data['service'];

            for (var j = 0; j < arrServiceName.length; j++) {
              this.arrService.push(arrServiceName[j]['service']);
            }

            this.DeviceDetailsServiceName = this.arrService;
          } else {
            this.dataAvailStatus = 'No data available';
          }
          this.popupLoading = false;

        } else if (data.param == 8) { // user info
          if (data.hasOwnProperty('userInfo') && data['userInfo'].length !== 0) {
            this.userNameCollections = data['userInfo'];
            this.userinfo_nodata = true;
          } else {
            this.userinfo_nodata = false;
            this.dataAvailStatus = 'No data available';
          }
          this.popupLoading = false;

        } else if (data.param == 9) {  // application protocol
          this.modelData = {};
          this.applicationInfoAccessed = [];
          if (data) {
            this.modelData = data;
            if (this.modelData.hasOwnProperty('applicationInfo') && this.modelData['applicationInfo'].length !== 0) {
              for (let i = 0; i < this.modelData['applicationInfo'].length; i++) {
                var str = this.modelData['applicationInfo'][i];
                this.applicationInfoAccessed.push({
                  version: this.modelData['applicationInfo'][i].attribute_version,
                  os_name: this.modelData['applicationInfo'][i].os_name,
                  application: this.modelData['applicationInfo'][i].attribute_value,
                  distribution: this.modelData['applicationInfo'][i].distribution,
                  vulnerabilities: this.modelData['applicationInfo'][i].isVulnerable
                });
              }
            } else {
              this.dataAvailStatus = 'No data available';
            }
          }
          this.popupLoading = false;

        }
        // if (
        //   this.modelData['tunnelProtocol'].length == 0 &&
        //   this.modelData['service'].length == 0 &&
        //   this.modelData['domainAccessed'].length == 0 &&
        //   this.modelData['applicationInfo'].length == 0
        // ) {
        //   this.otherinfo_nodata = 0;
        // }
        // this.FillerDeviceInfo(this.modelData);

        //this.protocolPiechart();
        // } else {
        // }
      } else {
        // console.log('No data avail');
      }
    });
    // end requestNodeDetailsForModel
  }

  prepareAttackSubcategory(attackSubcategory) {
    let fromObject: string = '';
    fromObject = this.attackSubcategory[attackSubcategory];
    return fromObject == undefined ? attackSubcategory : fromObject;
  }

  computeCurrentSlide(slideNo) {
    // console.log(slideNo);
    this.sliderData[this.sliderData.incidentType].currentSlide = this.sliderData[this.sliderData.incidentType].data[slideNo - this.sliderData[this.sliderData.incidentType].floatingIndex];
    // console.log(slideNo - this.sliderData[this.sliderData.incidentType].floatingIndex);
  }

  onIncidentTypeChange(event) {
    if (this.sliderData[event.value].count == 0) {
      this.tab_first(this.request_result, 3);
    } else {
      this.computeCurrentSlide(this.sliderData[event.value].currentSlideNo);
    }
  }

  onNextIncident() {
    // console.log(this.sliderData[this.sliderData.incidentType].currentSlideNo);
    // console.log(this.sliderData[this.sliderData.incidentType].availableCount - 1);
    if (this.sliderData[this.sliderData.incidentType].currentSlideNo < this.sliderData[this.sliderData.incidentType].availableCount - 1) {
      this.sliderData[this.sliderData.incidentType].currentSlideNo++
      this.computeCurrentSlide(this.sliderData[this.sliderData.incidentType].currentSlideNo);
    } else if (!this.sliderData[this.sliderData.incidentType].isNoData) {
      this.sliderData[this.sliderData.incidentType].start = this.sliderData[this.sliderData.incidentType].availableCount;
      if (this.sliderData[this.sliderData.incidentType] == 0) {
        this.sliderData[this.sliderData.incidentType].timestamp = this.sliderData[this.sliderData.incidentType].data[this.sliderData[this.sliderData.incidentType].availableCount - (1 + this.sliderData[this.sliderData.incidentType].floatingIndex)].timestamp;
      }
      this.tab_first(this.request_result, 3);
    }
  }


  onPrevIncident() {
    if (this.sliderData[this.sliderData.incidentType].currentSlideNo != -1 && this.sliderData[this.sliderData.incidentType].currentSlideNo != 0) {
      this.sliderData[this.sliderData.incidentType].currentSlideNo--;
      this.computeCurrentSlide(this.sliderData[this.sliderData.incidentType].currentSlideNo);
    } else {

    }
  }

  sumObjectValues(obj) {
    var sum = 0;
    for (var el in obj) {
      if (obj.hasOwnProperty(el)) {
        sum += obj[el];
      }
    }
    return sum;
  }

  private showTooltip(resp) {
    let tooltip = document.getElementById('ai3-dc-tooltip');
    let x =
      Math.sign(resp.node.userData.location.x) == -1
        ? resp.event.clientX + 10
        : resp.event.clientX - 100;
    let y = resp.event.clientY - 50;

    tooltip.style.left = x + 'px';
    tooltip.style.top = y + 'px';
    // tooltip.style.height = 100 + 'px';

    tooltip.innerHTML = `<span>IP: ${resp.node.userData.ip}</span> `;
    // tooltip.innerHTML = `<span>Host: ${resp.node.userData.ip}</span>`;
    tooltip.style.display = 'block';
  }

  hideTooltip() {
    let tooltip = document.getElementById('ai3-dc-tooltip');
    tooltip.style.display = 'none';
  }

  onFocusOut() { }

  // get the filter paylod for filter in device communication  canvas---------------------------------------
  public deviceCommFilterFn(deviceCommItem: any) {
    localStorage.setItem('deviceCommStatus', deviceCommItem);

    // if (localStorage.getItem('deviceCommStatus') != null) {
    //   const currentdeviceCommStatus = localStorage.getItem('activityStatus');
    //   deviceCommItem = currentdeviceCommStatus;
    //  // isDeviceCommInternalActive
    // }

    this.hideTooltip();

    this.mapGL.ResetEventLog();
    this.isDeviceCommunidationLoading = true;

    if (deviceCommItem === 'internalIP') {
      this.isDeviceCommActive = false;
      this.isDeviceCommExternalActive = false;
      this.isDeviceCommInternalActive = true;
      this.isDeviceCommBlockedActive = false;
      this.populateNodeInCanvas(this.devicecommdata, 'internalIP'); // show internalIP nodes alone
    } else if (deviceCommItem === 'externalIP') {
      this.isDeviceCommActive = false;
      this.isDeviceCommExternalActive = true;
      this.isDeviceCommInternalActive = false;
      this.isDeviceCommBlockedActive = false;
      this.populateNodeInCanvas(this.devicecommdata, 'externalIP'); // show externalIP nodes only
    } else if (deviceCommItem === 'all') {
      this.isDeviceCommActive = true;
      this.isDeviceCommExternalActive = false;
      this.isDeviceCommInternalActive = false;
      this.isDeviceCommBlockedActive = false;
      this.populateNodeInCanvas(this.devicecommdata, 'all'); // show all node with various node with color
    } else if (deviceCommItem === 'blacklistedIP') {
      this.isDeviceCommActive = false;
      this.isDeviceCommExternalActive = false;
      this.isDeviceCommInternalActive = false;
      this.isDeviceCommBlockedActive = true;
      this.populateNodeInCanvas(this.devicecommdata, 'blacklistedIP'); // show blocked ones
    }
  }

  /**
   * populate nodein canvas
   */
  public populateNodeInCanvas(data, filterType) {
    const param: any = data['deviceCommunication'];
    var blackList: any[] = data.hasOwnProperty('blacklistedIP') ? data['blacklistedIP'] : [];
    var vulnarableList: any[] = data.hasOwnProperty('vulnerableIP')
      ? data['blacklistedIP']
      : [];

    const new_Node: Node = new Node();
    new_Node.texture_type = data.hasOwnProperty('dev_type')
      ? data['dev_type']
      : 'uncategorized';

    if (Object.keys(param).length > 0) {
      this.isDeviceCommunicationDataAvail = false;
      const nodes: List<Node> = new List<Node>();

      if (filterType == 'all') {
        for (var key in param) {
          if (param.hasOwnProperty(key)) {
            const node: Node = new Node();
            // node.bytesTransfered.push(param[key]['bytestransfered']);
            // node.mac_address = param[key]['mac_address'];
            node.ipaddress = key;
            node.host_name = param[key];
            // node.license_key = param[key]['license_key'];
            // node.id = node.license_key + node.mac_address;
            nodes.Add(node);
          }
        }
      } else {
        data[filterType].map((filteredNode) => {
          const node: Node = new Node();
          // node.bytesTransfered.push(param[key]['bytestransfered']);
          // node.mac_address = param[key]['mac_address'];
          node.ipaddress = filteredNode;
          node.host_name = param[filteredNode];
          // node.license_key = param[key]['license_key'];
          // node.id = node.license_key + node.mac_address;
          nodes.Add(node);
        });
      }

      this.mapGL.populateConnectedDevices(
        nodes.ToArray(),
        blackList,
        vulnarableList,
        new_Node,
        null
      );
    } else {
      this.isDeviceCommunicationDataAvail = true;
    }

    this.isDeviceCommunidationLoading = false;
  }


  public getValidPortOnly(bytesTransfered) {
    const fObj = {},
      fArr = [];
    this.fArrLabel = [];
    for (var key in bytesTransfered) {
      if (bytesTransfered[key] > 0) {
        fObj[key] = bytesTransfered[key];
        this.fArrLabel.push(key);
      }
    }
    fArr.push(fObj);
    return this.fArrLabel;
  }
  private _filter(value: string): string[] {
    this.modalDeviceDetailsInfo.devtype = value;
    const filterValue = value.toLowerCase();
    return this.options.filter(option => option.toLowerCase().includes(filterValue));
  }

  private _filter1(value1: string): string[] {
    this.modalDeviceDetailsInfo.manufacture = value1;
    const filterValue = value1.toLowerCase();
    return this.options1.filter(option => option.toLowerCase().includes(filterValue));
  }

  private _filter2(value2: string): string[] {
    this.modalDeviceDetailsInfo.model = value2;
    const filterValue = value2.toLowerCase();
    return this.options2.filter(option => option.toLowerCase().includes(filterValue));
  }

  /* On device details field close */
  public closeCrowdSourcingData(nameOfFieldToClose) {
    switch (nameOfFieldToClose) {
      case 'hostname':
        this.hostNameFieldToggler = false;
        this.deviceDetailsForm.controls['hostName'].setValue(this.hostNameFieldHolder);
        break;
      case 'manufacturer':
        this.manufacturerToggler = false;
        this.deviceDetailsForm.controls['manufacturer'].setValue(this.manufacturerHolder);
        break;
      case 'devtype':
        this.deviceTypeToggler = false;
        this.deviceDetailsForm.controls['deviceType'].setValue(this.deviceTypeHolder);
        break;
      case 'os':
        this.osFieldToggler = false;
        this.deviceDetailsForm.controls['os'].setValue(this.osFieldHolder);
        break;
      case 'version':
        this.versionFieldToggler = false;
        this.deviceDetailsForm.controls['version'].setValue(this.versionFieldHolder);
        break;
      case 'model':
        this.modelToggler = false;
        this.deviceDetailsForm.controls['model'].setValue(this.modelHolder);
        break;
      default:
        confirm('Sorry, that nameOfFieldToClose is not in the system yet!');
    }
  }


  closeEveryInputs() {
    if (this.hostNameFieldToggler) {
      this.closeCrowdSourcingData('hostname');
    } else if (this.manufacturerToggler) {
      this.closeCrowdSourcingData('manufacturer');
    } else if (this.deviceTypeToggler) {
      this.closeCrowdSourcingData('devtype');
    } else if (this.osFieldToggler) {
      this.closeCrowdSourcingData('os');
    } else if (this.versionFieldToggler) {
      this.closeCrowdSourcingData('version');
    } else if (this.modelToggler) {
      this.closeCrowdSourcingData('model');
    }
  }

  /* On device details field focus */
  public focusElement(nameOfElement) {
    this.closeEveryInputs();
    switch (nameOfElement) {
      case 'hostname':
        this.hostNameFieldToggler = true;
        this.hostNameFieldHolder = this.deviceDetailsForm.controls['hostName'].value;
        setTimeout(() => {
          this.hostNameElement.nativeElement.focus();
        }, 0);
        break;
      case 'manufacturer':
        this.manufacturerToggler = true;
        this.manufacturerHolder = this.deviceDetailsForm.controls['manufacturer'].value;
        setTimeout(() => {
          document.getElementById('manufacturer').focus();
        }, 0);
        break;
      case 'devtype':
        this.deviceTypeToggler = true;
        this.deviceTypeHolder = this.deviceDetailsForm.controls['deviceType'].value;
        setTimeout(() => {
          document.getElementById('deviceType').focus();
        }, 0);
        break;
      case 'os':
        this.osFieldToggler = true;
        this.osFieldHolder = this.deviceDetailsForm.controls['os'].value;
        setTimeout(() => {
          this.osElement.nativeElement.focus();
        }, 0);
        break;
      case 'version':
        this.versionFieldToggler = true;
        this.versionFieldHolder = this.deviceDetailsForm.controls['version'].value;
        setTimeout(() => {
          this.versionElement.nativeElement.focus();
        }, 0);
        break;
      case 'model':
        this.modelToggler = true;
        this.modelHolder = this.deviceDetailsForm.controls['model'].value;
        setTimeout(() => {
          document.getElementById('model').focus();
        }, 0);
        break;
      default:
        confirm('Sorry, that nameOfFieldToClose is not in the system yet!');
    }
  }

  /* On device details field save */
  public saveCrowdSourcingData(nameOfField) {
    let customisedParam: any = {};
    customisedParam.collector = this.modalDeviceDetailsInfo.collector;
    customisedParam.ip = this.modalDeviceDetailsInfo.ip;
    customisedParam.mac = this.modalDeviceDetailsInfo.mac;
    customisedParam.master_id = this.modalDeviceDetailsInfo.master_id;
    // customisedParam.model = this.modalDeviceDetailsInfo.model;
    switch (nameOfField) {
      case 'hostname':
        this.hostNameFieldToggler = false;
        if (this.hostNameFieldHolder != this.deviceDetailsForm.controls['hostName'].value) {
          this.modalDeviceDetailsInfo.host_name = this.deviceDetailsForm.controls['hostName'].value;

          customisedParam.host_name = this.modalDeviceDetailsInfo.host_name;
          this.saveDataAndUpdateTable(customisedParam);
          // this.saveDataAndUpdateTable(this.modalDeviceDetailsInfo);
        }
        break;
      case 'manufacturer':
        this.manufacturerToggler = false;
        if (this.manufacturerHolder != this.deviceDetailsForm.controls['manufacturer'].value) {
          this.modalDeviceDetailsInfo.manufacture = this.deviceDetailsForm.controls[
            'manufacturer'
          ].value;

          customisedParam.manufacture = this.modalDeviceDetailsInfo.manufacture;
          this.saveDataAndUpdateTable(customisedParam);
          // this.saveDataAndUpdateTable(this.modalDeviceDetailsInfo);
        }
        break;
      case 'devtype':
        this.deviceTypeToggler = false;
        this.showUncategorizedException = false;
        if (this.deviceTypeHolder != this.deviceDetailsForm.controls['deviceType'].value) {
          // console.log(this.deviceDetailsForm.controls['deviceType'].value);

          let caseUpper = this.deviceDetailsForm.controls['deviceType'].value.toUpperCase();

          if (caseUpper != 'UNCATEGORIZED') {
            this.modalDeviceDetailsInfo.devtype = caseUpper;
            this.DeviceTypeImageSet(this.modalDeviceDetailsInfo.devtype);
            this.mapGL.updatedeviceTexture(this.modalDeviceDetailsInfo.devtype);

            customisedParam.devtype = this.modalDeviceDetailsInfo.devtype;
            this.saveDataAndUpdateTable(customisedParam);
            // this.saveDataAndUpdateTable(this.modalDeviceDetailsInfo);
          } else {
            this.showUncategorizedException = true;
          }
        }
        break;
      case 'os':
        this.osFieldToggler = false;
        if (this.osFieldHolder != this.deviceDetailsForm.controls['os'].value) {
          this.modalDeviceDetailsInfo.osname = this.deviceDetailsForm.controls['os'].value;

          customisedParam.osname = this.modalDeviceDetailsInfo.osname;
          this.saveDataAndUpdateTable(customisedParam);
          // this.saveDataAndUpdateTable(this.modalDeviceDetailsInfo);
        }
        break;
      case 'version':
        this.versionFieldToggler = false;
        if (this.versionFieldHolder != this.deviceDetailsForm.controls['version'].value) {
          this.modalDeviceDetailsInfo.version = this.deviceDetailsForm.controls['version'].value;

          customisedParam.version = this.modalDeviceDetailsInfo.version;
          this.saveDataAndUpdateTable(customisedParam);
          // this.saveDataAndUpdateTable(this.modalDeviceDetailsInfo);
        }
        break;
      case 'model':
        this.modelToggler = false;
        if (this.modelHolder != this.deviceDetailsForm.controls['model'].value) {
          this.modalDeviceDetailsInfo.model = this.deviceDetailsForm.controls['model'].value;

          customisedParam.model = this.modalDeviceDetailsInfo.model;
          this.saveDataAndUpdateTable(customisedParam);
          // this.saveDataAndUpdateTable(this.modalDeviceDetailsInfo);
        }
        break;
      default:
        confirm('Sorry, that nameOfFieldToClose is not in the system yet!');
    }
  }

  /* Save event to sockets and table update*/
  saveDataAndUpdateTable(customisedParam) {
    this.socket.crowdSourcing(customisedParam);

    // setTimeout(() => {
    //   this.restService
    //     .device_type()
    //     .then(data => { })
    //     .catch(err => { });
    // }, 1000);
  }

  communicatedChartFn() {
    this.communicatedDeviceChart = {
      labels: this.cLabel,
      datasets: [
        {
          data: this.cData,
          backgroundColor: this.cColour,
          hoverBackgroundColor: this.cColour,
          borderWidth: 0
        }
      ]
    };
  }
  /**
   * Activity Line Chart
   */
  public ActivityLineChartFn() {
    this.ActivityLineChart = {
      labels: this.ActivityLineChartLabel,
      datasets: [
        {
          label: ' Last activity ',
          data: this.ActivityLineChartData,
          fill: false,
          borderColor: '#4bc0c0',
          pointHoverRadius: 3
        }
      ]
    };
    this.ActivityLineOptions = {
      responsive: true,
      maintainAspectRatio: false,
      title: {
        display: false,
        fontSize: 12
      },
      legend: {
        display: true,
        position: 'top',
        onClick: function (e) {
          e.stopPropagation();
        }
      },
      scales: {
        yAxes: [
          {
            ticks: {
              beginAtZero: true,
              userCallback: function (label, index, labels) {
                if (Math.floor(label) === label) {
                  return label;
                }
              }
            }
          }
        ]
      },
      showAllTooltips: true,

      tooltips: {
        displayColors: false,
        enabled: true,
        mode: 'single',
        custom: function (tooltip) {
          if (!tooltip) {
            return;
          }
          // disable displaying the color box;
          tooltip.displayColors = false;
        },
        callbacks: {
          label: function (t, d) {
            if (t.datasetIndex === 0) {
              return '  ' + t.yLabel;
            }
          },
          // remove title
          title: function (tooltipItem, data) {
            return;
          }
        }
      }
    };
  }

  public selectActivityLineChart(event) {
    // console.log(event);
  }

  public portPiechart(data) {
    if (data['openPort'] === undefined || data['openPort'].length === 0) {
      this.isPortData = true;
    } else {
      this.portBgArray = [];
      this.portBgColor = [];
      const app_protocol = {
        '1': 'ICMP',
        '6': 'TCP',
        '17': 'UDP',
        '1001': 'STP',
        '1002': 'ARP',
        '1003': 'HTTP',
        '1004': 'HTTP REQUEST',
        '1005': 'HTTP RESPONSE',
        '1006': 'SSL',
        '1007': 'DHCP',
        '1008': 'DNS',
        '1009': 'FTP',
        '1010': 'SSH',
        '1011': 'DICOM',
        '1012': 'HL7',
        '1013': 'SSDP',
        '1014': 'UPNP',
        '1015': 'SNMP',
        '1016': 'MDNS'
      };
      let openPort = data['openPort'];
      let counter = {};
      let appProtocol = {};

      openPort.forEach(function (obj) {
        let key = obj['service_name'].toUpperCase() + ' : ' + app_protocol[obj['protocol_type']];
        let keyProtocoltype = obj['protocol_type'];
        counter[key] = (counter[key] || 0) + 1;
        appProtocol[keyProtocoltype] = (appProtocol[keyProtocoltype] || 0) + 1;
      });

      // console.log(counter);
      this.DeviceDetailsPortLabels = Object.keys(counter);
      this.DeviceDetailsPort = Object.values(counter);

      // Application protocol
      // console.log(appProtocol);
      this.protocolArray = Object.values(appProtocol);
      const protocolLabelTemp = Object.keys(appProtocol);
      // application protocol
      for (let index = 0; index < Object.keys(appProtocol).length; ++index) {
        this.protocolLabel.push(app_protocol[protocolLabelTemp[index]]);
        this.protocolBgColor.push(
          '#' + (0x1000000 + Math.random() * 0xffffff).toString(16).substr(1, 6)
        );
      }
      // port process
      for (let index = 0; index < this.DeviceDetailsPortLabels.length; ++index) {
        this.portBgColor.push(
          '#' + (0x1000000 + Math.random() * 0xffffff).toString(16).substr(1, 6)
        );
      }
    }

    this.ApplicationData = {
      labels: this.protocolLabel,
      datasets: [
        {
          data: this.protocolArray,
          backgroundColor: this.protocolBgColor,
          hoverBackgroundColor: this.protocolBgColor,
          borderWidth: 0
        }
      ]
    };

    this.PortData = {
      labels: this.DeviceDetailsPortLabels,
      datasets: [
        {
          data: this.DeviceDetailsPort,
          backgroundColor: this.portBgColor,
          hoverBackgroundColor: this.portBgColor,
          borderWidth: 0
        }
      ]
    };

    if (data.hasOwnProperty('tunnelProtocol') && data['tunnelProtocol'].length !== 0) {
      this.DArray = [];
      let arrtunnelPortocol: any[] = data['tunnelProtocol'];

      for (var j = 0; j < arrtunnelPortocol.length; j++) {
        this.DArray.push(arrtunnelPortocol[j].protocol_type.toUpperCase());
      }
      this.DeviceDetailstunnelPortocol = this.DArray.filter(function (elem, index, self) {
        return index === self.indexOf(elem);
      });
    } else {
      this.dataAvailStatus = 'No data available';
    }

    this.popupLoading = false;

  }

  private sortArray(orgArray, final) {
    let finalArray = [];
    orgArray.sort((n1, n2) => n2 - n1);

    for (var i = 0; i < orgArray.length; i++) {
      finalArray.push(final.indexOf(orgArray[i]));
    }
    return finalArray;
  }

  updateNodeDetailsOnModal(info: any) {
    throw new Error('Method not implemented.');
  }

  // processing the data

  public FillerDeviceInfo(deviceInfo) {
    // console.log(deviceInfo);
    this.selectedDevice = deviceInfo['selectedDeviceInfo'];

    this.modalDeviceDetailsInfo.host_name = deviceInfo.hasOwnProperty('host_name')
      ? deviceInfo['host_name']
      : '';
    this.modalDeviceDetailsInfo.manufacture = deviceInfo.hasOwnProperty('m_name')
      ? deviceInfo['m_name']
      : '';

    /* Initialize form controls of device details */
    this.deviceDetailsForm.controls['hostName'].setValue(
      deviceInfo.hasOwnProperty('host_name') ? deviceInfo['host_name'] : ''
    );
    this.deviceDetailsForm.controls['manufacturer'].setValue(
      deviceInfo.hasOwnProperty('m_name') ? deviceInfo['m_name'] : ''
    );
    this.deviceDetailsForm.controls['deviceType'].setValue(
      deviceInfo.hasOwnProperty('dev_type') ? deviceInfo['dev_type'] : ''
    );
    this.deviceDetailsForm.controls['os'].setValue(
      deviceInfo.hasOwnProperty('os_name') ? deviceInfo['os_name'] : ''
    );
    this.deviceDetailsForm.controls['version'].setValue(
      deviceInfo.hasOwnProperty('version') ? deviceInfo['version'] : ''
    );
    this.deviceDetailsForm.controls['model'].setValue(
      deviceInfo.hasOwnProperty('m_model') ? deviceInfo['m_model'] : ''
    );

    this.modalDeviceDetailsInfo.manufacture = deviceInfo.hasOwnProperty('m_name')
      ? deviceInfo['m_name']
      : '';

    this.myControl1.setValue(this.modalDeviceDetailsInfo.manufacture);

    this.modalDeviceDetailsInfo.devtype = deviceInfo.hasOwnProperty('dev_type')
      ? deviceInfo['dev_type']
      : '';

    this.DeviceTypeImageSet(this.modalDeviceDetailsInfo.devtype);

    this.myControl.setValue(this.modalDeviceDetailsInfo.devtype);

    this.modalDeviceDetailsInfo.ip = deviceInfo.hasOwnProperty('ipaddress')
      ? deviceInfo['ipaddress']
      : '';
    this.modalDeviceDetailsInfo.osname = deviceInfo.hasOwnProperty('os_name')
      ? deviceInfo['os_name']
      : '';
    this.modalDeviceDetailsInfo.mac = deviceInfo.hasOwnProperty('mac_address')
      ? deviceInfo['mac_address']
      : '';
    this.modalDeviceDetailsInfo.version = deviceInfo.hasOwnProperty('version')
      ? deviceInfo['version']
      : '';
    this.modalDeviceDetailsInfo.model = deviceInfo.hasOwnProperty('m_model')
      ? deviceInfo['m_model']
      : '';

    this.myControl2.setValue(this.modalDeviceDetailsInfo.model);

    this.modalDeviceDetailsInfo.desc = deviceInfo.hasOwnProperty('desc') ? deviceInfo['desc'] : '';
    this.modalDeviceDetailsInfo.collector = deviceInfo.hasOwnProperty('license_key')
      ? deviceInfo['license_key']
      : '';

    // ---------------------------------------- servicename details

    if (deviceInfo.hasOwnProperty('servicename') && deviceInfo['servicename'].length !== 0) {
      const arrServiceName = this.modelData['servicename'];
      this.DeviceDetailsServiceName = arrServiceName.filter(function (item, pos) {
        return arrServiceName.indexOf(item) === pos;
      });
    } else {
    }

    // ---------------------------------------- TunnelPortocol details

    if (deviceInfo.hasOwnProperty('tunnelProtocol') && deviceInfo['tunnelProtocol'].length !== 0) {
      this.DeviceDetailstunnelPortocol = [];
      let arrtunnelPortocol: any[] = this.modelData['tunnelProtocol'];

      for (var j = 0; j < arrtunnelPortocol.length; j++) {
        this.DArray.push(arrtunnelPortocol[j].protocol_type.toUpperCase());
      }
      this.DeviceDetailstunnelPortocol = this.DArray.filter(function (elem, index, self) {
        return index === self.indexOf(elem);
      });
    } else {
    }

    // ---------------------------------------- user details
    if (deviceInfo.hasOwnProperty('userInfo') && deviceInfo['userInfo'].length != 0) {
      this.isUserListNull = true;
      this.UserDetailsObj = deviceInfo['userInfo'];
      this.userNameCollections = deviceInfo['userInfo'];
    } else {
      this.isUserListNull = false;
    }

    // -------------------------------------- line chart
    this.ActivityLineChartLabel = [];
    if (
      deviceInfo.hasOwnProperty('deviceActivity') &&
      !this.isEmpty(deviceInfo['deviceActivity'])
    ) {
      // console.log(deviceInfo['deviceActivity']);

      for (
        let id = 0;
        id < Object.values(deviceInfo['deviceActivity']['vertices']).length - 1;
        id++
      ) {
        this.ActivityLineChartLabel.push(this.jstime(deviceInfo['deviceActivity']['vertices'][id]));
      }

      let clength = deviceInfo['deviceActivity']['vertices'].length - 1;
      const ddate = new Date(deviceInfo['deviceActivity']['vertices'][clength] * 1000);

      this.LastActivityDate =
        ddate.getUTCDate() +
        '-' +
        (ddate.getUTCMonth() + 1) +
        '-' +
        ddate.getUTCFullYear() +
        '  ' +
        ddate.getHours() +
        ' : ' +
        ddate.getMinutes() +
        ' : ' +
        ddate.getSeconds();
      this.ActivityLineChartData = Object.values(deviceInfo['deviceActivity']['edges']);

      if (this.ActivityLineChartData.length > 0) {
        this.ActivityLineChart = {
          labels: this.ActivityLineChartLabel,
          datasets: [
            {
              label: ' Last activity ',
              data: this.ActivityLineChartData,
              fill: false,
              borderColor: '#4bc0c0'
            }
          ]
        };

        this.ActivityLineChartFn(); // activity line charts
      } else {
        this.ActivityLineChartData = [];
        this.ActivityLineChartLabel = [];
        this.isActivityLineChartData = true;
        this.dataAvailStatus = 'Activity line no data available';
      }
    } else {
      //   alert('no data');
      this.ActivityLineChartData = [];
      this.ActivityLineChartLabel = [];
      this.dataAvailStatus = 'No data available';
    }

    // -------------------------------------- pie chart - app protocols
    let app_protocol = {
      '1': 'ICMP',
      '6': 'TCP',
      '17': 'UDP',
      '1001': 'STP',
      '1002': 'ARP',
      '1003': 'HTTP',
      '1004': 'HTTP REQUEST',
      '1005': 'HTTP RESPONSE',
      '1006': 'SSL',
      '1007': 'DHCP',
      '1008': 'DNS',
      '1009': 'FTP',
      '1010': 'SSH',
      '1011': 'DICOM',
      '1012': 'HL7',
      '1013': 'SSDP',
      '1014': 'UPNP',
      '1015': 'SNMP',
      '1016': 'MDNS'
    };

  }

  public DeviceTypeImageSet(devtype) {

    let selectedNodetextureid = this.textureID.DeviceTypeID[devtype.toLowerCase()];
    if (!selectedNodetextureid || selectedNodetextureid == undefined) {
      this.deviceImageIs = "iot";
    }
    else {
      this.deviceImageIs = this.img_src.Device_SRC[selectedNodetextureid];
    }

    // if (devtype == 'ASUS Router') {
    //   this.deviceImageIs = 'router';
    // } else if (devtype == 'ASUS WPS Router') {
    //   this.deviceImageIs = 'router';
    // } else if (devtype == 'uncategorized') {
    //   this.deviceImageIs = 'iot';
    // } else if (!devtype || devtype == '') {
    //   this.deviceImageIs = 'iot';
    // } else {
    //   this.deviceImageIs = devtype.toLowerCase();
    // }
  }

  private Animate() {
    if (this.frameUpdate) {
      this.mapGL.Update();
      requestAnimationFrame(this.Animate.bind(this));
    }
  }
  public onWindowResizeEvent(event) {
    this.mapGL.WindowResize(event);
  }

  public isEmpty(obj) {
    for (let key in obj) {
      if (obj.hasOwnProperty(key)) {
        return false;
      }
    }
    return true;
  }

  public ngOnDestroy() {
    localStorage.setItem('crowdPopupAppearedforSettings', '0');
    let tooltip = document.getElementById('ai3-dc-tooltip');
    tooltip.parentNode.removeChild(tooltip);

    this.requestNodeDetailsForModel.unsubscribe();
    this.crowdSourcingConn.unsubscribe();

    window.removeEventListener('scroll', this.onScroll, true);

    if (this.mapGL.scene != null || this.mapGL.scene != undefined) {
      this.mapGL.Dispose();
    }
  }

  /**
   * getUserDetails
   */
  public getUserDetails(e: any, username: any, i: number) {
    if (i === 1) {
      this.isFirstItemOfTheList = true;
    } else {
      this.isFirstItemOfTheList = false;
    }

    this.UserDetailsCollections = [];
    this.UserDetailsCollections.length = 0;
    let tempObj = {};

    if (typeof this.UserDetailsObj != 'undefined') {
      if (Object.keys(this.UserDetailsObj).indexOf(username) > -1) {
        tempObj['badpasswordcount'] = this.UserDetailsObj[username].badpasswordcount;
        tempObj['badpasswordtime'] = this.UserDetailsObj[username].badpasswordtime;
        tempObj['lastlogoff'] = this.UserDetailsObj[username].lastlogoff;
        tempObj['lastlogon'] = this.UserDetailsObj[username].lastlogon;
        tempObj['logoncount'] = this.UserDetailsObj[username].logoncount;
        tempObj['passwordlastset'] = this.UserDetailsObj[username].passwordlastset;
        this.UserDetailsCollections.push(tempObj);
      }
    }
  }

  public jstime(value) {
    if (value) {
      let fulldate = new Date(0);
      fulldate.setUTCSeconds(value);
      const monthAndDate = fulldate.toString().substr(3, 8);
      const timeinSec = fulldate.toString().substr(16, 5);
      return timeinSec;
    } else {
      return ' - ';
    }
  }
}
export class Device_SRC_ID {
  Device_SRC = {
    9: "laptop",
    10: "iot",
    11: "printer",
    12: "router",
    13: "thermostat",
    14: "bulb",
    15: "mobile",
    16: "accesspoint",
    17: "camera",
    18: "nas",
    19: "ipad",
    20: "desktop"
  }
}
