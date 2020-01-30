import { analyzeAndValidateNgModules } from '@angular/compiler';
import {
  Component,
  OnInit,
  OnDestroy,
  ViewChild,
  ElementRef,
  HostListener,
  Renderer2
} from '@angular/core';
import { SocketdataService } from 'src/app/services/socketdata.service';
import { ToastrService } from 'ngx-toastr';
import { IntercommunicationService } from 'src/app/services/intercommunication.service';
import { RestserviceService } from 'src/app/services/restservice.service';
import { Subscription } from 'rxjs/Subscription';
import { FormBuilder, FormGroup, FormControl, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { UnityService } from '../alldevices/services/UnityService.service';
import { IntervalObservable } from 'rxjs/observable/IntervalObservable';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { MustMatch } from 'src/app/_helpers/must-match.validator';
import 'rxjs/add/operator/takeWhile';
import { Dialog } from 'primeng/dialog';
import { AppComponent } from 'src/app/app.component';
import { ConfirmationService } from 'primeng/api';
import { Dropdown } from 'primeng/primeng';

export interface LiscensManagement {
  licence_key;
  resetLink;
  downloadLink;
  licence_desc;
  licence_location;
  streamflow_mod_cnt;
  downloadwindowsLink;
  isEnvironment_state;
}

export interface WLC {
  vendor;
  ipaddress;
  username;
  password;
}

export interface Subnet {
  subnet;
  desc;
}

export interface EmailReport {
  emailid;
}

export interface Asset {
  status;
  aws_access_key_id;
  aws_secret_key;
  aws_region;
  asset_id;
}

export interface ADconfig {
  status;
  domain_name;
  ip_address;
  admin_account;
}

@Component({
  selector: 'app-setting',
  templateUrl: './setting.component.html',
  styleUrls: ['./setting.component.css']
})
export class SettingComponent implements OnInit, OnDestroy {
  @ViewChild('scrollMelog') private myScrollContainerlog: ElementRef;
  @ViewChild('scrollMetie') private myScrollContainertie: ElementRef;

  @ViewChild('resetDialog') resetDialog: Dialog;
  @ViewChild('upgardeDialog') upgardeDialog: Dialog;
  @ViewChild('descDialog') descDialog: Dialog;
  @ViewChild('ipaddressDialog') ipaddressDialog: Dialog;
  @ViewChild('userManagementDialog') userManagementDialog: Dialog;
  @ViewChild('emailDialog') emailDialog: Dialog;
  @ViewChild('adDialog') adDialog: Dialog;
  @ViewChild('wlcDialog') wlcDialog: Dialog;
  @ViewChild('awsDialog') awsDialog: Dialog;
  @ViewChild('locationDialog') locationDialog: Dialog;
  @ViewChild('editDialog') editDialog: Dialog;
  @ViewChild('dd') public dd: ElementRef;
  @ViewChild('userdropDown') public userdropDown: ElementRef;

  // wlc drop down status
  public isJuniperSelected = false;
  public isCiscoSelected = false;
  public isSolarSelected = false;

  connection;
  subscription: Subscription;
  public SettingsLoading = false;
  isalive = true;
  license: any = [];
  New_License: any = [];
  setting_values: any = [];
  setting_values_New: any = [];
  venderlist: any = [];
  userRoleList: any = [];
  customer_id: any = [];
  user_id: number;
  ss: number = 0;
  selectedCategories_log: string[] = ['Autorefresh_log'];
  selectedCategories_tie: string[] = ['Autorefresh_tie'];
  public isAutoUpdateChecked_log: boolean = true;
  public isAutoUpdateChecked_tie: boolean = true;

  public buttonEnabled_windows: boolean = false;
  public buttonEnabled_linux: boolean = false;

  checked: boolean = false;

  logs_test: number = 6;
  notify_test: number = 1;
  validEmail: boolean = false;
  ipaddress: any;
  model: any = {};
  model_ip: any = {};
  width: number = 90;
  table_height: any;
  id: any;

  liscensmanagement: LiscensManagement[] = [];
  wlc: WLC[] = [];
  subnet: Subnet[] = [];
  asset: Asset[] = [];
  adconfig: ADconfig[];
  emailreport: EmailReport[] = [];

  reset_popup: boolean = false;
  upgrade_popup: boolean = false;
  location_popup: boolean = false;
  edit_popup: boolean = false;
  desc_popup: boolean = false;
  wlc_popup: boolean = false;
  aws_popup: boolean = false;
  email_popup: boolean = false;
  ad_popup: boolean = false;
  ipaddress_popup: boolean = false;

  aws_status: any;
  ad_status: any;
  wlcadd_btn: any;

  selectedVender: any = { name: '' };
  selectedRole: { role: string }; // user mgt
  selectedCustomer: any;
  isGlDisabled: boolean = false;
  sshNote: boolean = true;

  public logger_log: any;
  public logger_tie: any;
  public subnetList_ip = [];
  public adconfigList: any[];
  public assetList: any[];
  public subnetList_email: any[];
  public emailerrormsg: string = '';
  public usernameerrormsg = '';
  public usernamemsg = '';
  public errormsg: string = '';
  public ip_address_errormsg: string = '';
  public passworderrormsg: string = '';
  public errormsg_desc: string = '';
  public showAddEmailBtn: boolean = false;
  public passwordOLD: any;
  public edit_dropdown: boolean = false; // wlc dropdon enable
  public asseterrormsg: string = '';

  public re: any;
  public re_ip: any;
  FilterSelect = 3;
  Current_customer_id: any;
  Current_customer_name: any;
  Current_license: any;

  public SubnetVal1;
  public SubnetVal2;
  public SubnetVal3;
  public SubnetVal4;
  public SubnetVal5;
  isnum: boolean;
  ismaskvalue: boolean;
  filters: Array<Object> = [
    { id: 3, name: '100 ' },
    { id: 2, name: '75 ' },
    { id: 1, name: '50  ' },
    { id: 0, name: '25 ' }
  ];

  Current_page: any;
  old_subnet: any;

  ad_configuration: any;
  aws_configuration: any;
  selected_path: any;
  Email_no_data_status: any;
  result: any;

  public selectname_log: string = 'discoveryInfo';
  public selectname_tie: string = 'vullog';
  public innerHeight: string;
  public change_innerHeight: string;
  public change_innerHeight_div: string;

  public dataLoading: boolean = false;

  changepasswordForm: FormGroup;
  enableForm: FormGroup;
  enableFormAWS: FormGroup;

  enableFormwlc: FormGroup;

  editForm: FormGroup;

  submitted = false;
  submit = false;
  edited = false;
  awssubmit = false;
  wlcsubmit = false;
  val1: string = 'DISABLE';
  val2: string = 'DISABLE';
  val3: string = 'ADMIN';
  changepassword_type: string = 'admin';

  Current_option_ad: any = 1;
  Current_option_aws: any = 0;
  display_details_wlc: any = [];

  type = 'password';
  type1 = 'password';
  type2 = 'password';
  type3 = 'password';

  show = false;
  private headerEvent: Subscription = null;
  public idWLC: number;

  active_list: string;

  /* Prod build fixes */
  primaryColour: any;
  loadingTemplate: any;
  setting: any;

  isSettingsDownloadEnable: boolean;
  asset_config_status: any;
  asset_edited_value: any;
  subnet_status: any;

  public vendorOneSubmitted = false;
  public vendorTwoSubmitted = false;
  public vendorThreeSubmitted = false;
  public isWlcEditEnabled = false;
  public wlcListLoading = false;
  public CurrentVendor: string;

  public user_management_popup = false;
  public user_mgt_status: any;
  public userMgtList: any[];
  public userEmailValid = false;
  public usernameValid = false;
  public StoredAccessKeyList: any[] = [];
  public StoredIPAddressList: any[] = [];
  errorMsgAccessKeyDuplicate: string;
  errorMsgIPAddressDuplicate: string = '';
  isAccesskeyErDuplicated = false;
  isIPAddressErDuplicated = false;
  userMsg = false;

  @HostListener('window:resize', ['$event'])
  onResize(event) {
    if (window.innerWidth >= 992) {
      this.closeNav();
    }
  }

  @HostListener('window:orientationchange', ['$event'])
  onOrientationChange(event) {
    // this.closeNav();
    document.getElementById('ai3-sidenav').style.width = '0';

    setTimeout(() => {
      if (this.reset_popup) {
        this.resetDialog.center();
      } else if (this.upgrade_popup) {
        this.upgardeDialog.center();
      } else if (this.desc_popup) {
        this.descDialog.center();
      } else if (this.ipaddress_popup) {
        this.ipaddressDialog.center();
      } else if (this.email_popup) {
        this.emailDialog.center();
      } else if (this.ad_popup) {
        this.adDialog.center();
      } else if (this.wlc_popup) {
        this.wlcDialog.center();
      } else if (this.aws_popup) {
        this.awsDialog.center();
      } else if (this.location_popup) {
        this.locationDialog.center();
      } else if (this.edit_popup) {
        this.editDialog.center();
      } else if (this.edit_popup) {
        this.editDialog.center();
      }
    }, 100);
  }

  constructor(
    private formBuilder: FormBuilder,
    private socketdataService: SocketdataService,
    private toastr: ToastrService,
    private intercomm: IntercommunicationService,
    private restService: RestserviceService,
    public unityService: UnityService,
    public router: Router,
    public http: HttpClient,
    private renderer: Renderer2,
    private app: AppComponent,
    private confirmationService: ConfirmationService
  ) {
    this.isSettingsDownloadEnable = this.app.isSettingsDownloadEnable;
    this.SubnetVal1 = '';
    this.SubnetVal2 = '';
    this.SubnetVal3 = '';
    this.SubnetVal4 = '';
    this.SubnetVal5 = '';
    this.user_id = parseInt(localStorage.getItem('setting_customer_id'));
    this.active_list = 'licence';
  }

  ngAfterViewChecked() {
    this.scrollToBottom_log();
    this.scrollToBottom_tie();
  }

  ngOnInit() {

    localStorage.setItem('crowdPopupAppearedforSettings', '0');
    this.userRoleList = [];
    this.userMgtList = [];
    this.userRoleList = [{ role: 'admin' }, { role: 'user' }];

    if (!this.unityService.binaryStatus && this.unityService.isDesktop) {
      this.router.navigate(['/alldevices']);
    } else {
      localStorage.setItem('last_loaded_screen', '/alldevices/settings');

      this.innerHeight = (window.innerHeight - 100) * 0.6 + 'px';
      this.intercomm.setpageBg(false); //  [ngClass]="pageBgStatus ? 'black-bg' : 'gray-bg'">
      // this.battleInit();
      this.applyFilter_log();
      this.applyFilter_tie();
      this.clear();
      this.customer_details_list(0);
      this.header_dropdown_click();
      this.form_creation();
      this.get_JSON();

      // log
      localStorage.setItem('logUpdate_log', '1');
      if (
        localStorage.getItem('logUpdate_log') == '0' ||
        localStorage.getItem('logUpdate_log') == null
      ) {
        this.isAutoUpdateChecked_log = false;
      } else {
        this.isAutoUpdateChecked_log = true;
        this.scrollToBottom_log();
      }

      this.connection = this.socketdataService.getModuleLog().subscribe(loginfo => {
        this.dataLoading = false;
        if (this.isAutoUpdateChecked_log) {
          this.updateModuleLog_log(loginfo);
        }
      });

      // tie
      localStorage.setItem('logUpdate_tie', '1');
      if (
        localStorage.getItem('logUpdate_tie') == '0' ||
        localStorage.getItem('logUpdate_tie') == null
      ) {
        this.isAutoUpdateChecked_tie = false;
      } else {
        this.isAutoUpdateChecked_tie = true;
        this.scrollToBottom_tie();
      }

      this.connection = this.socketdataService.getModuleLog().subscribe(loginfo => {
        this.dataLoading = false;
        if (this.isAutoUpdateChecked_tie) {
          this.updateModuleLog_tie(loginfo);
        }
      });
    }
    if (this.user_id == 0) {
      IntervalObservable.create(5000)
        .takeWhile(() => this.isalive)
        .subscribe(() => {
          // log
          if (this.active_list == 'log') {
            if (this.isAutoUpdateChecked_log) {
              this.applyFilter_log();
            }
          }
          // tie
          if (this.active_list == 'tie') {
            if (this.isAutoUpdateChecked_tie) {
              this.applyFilter_tie();
            }
          }
        });
    }

    if (localStorage.getItem('move_to_setting') == '1') {
      this.collape('licence');
    }

    this.collape('licence');
  }

  form_creation() {
    this.changepasswordForm = this.formBuilder.group(
      {
        current: ['', Validators.required],
        new: [
          '',
          [Validators.required, Validators.pattern("^(?=.*?[A-Z])(?=.*?[a-z])(?=.*?[0-9])(?=.*?[#?!@$%^&*-]).{8,}$")]
        ],
        password: ['', [Validators.required]]
      },
      {
        validator: MustMatch('new', 'password')
      }
    );

    this.enableForm = this.formBuilder.group({
      username: ['', [Validators.required, Validators.pattern(/^\S$|^\S[\s\S]*\S$/)]],
      enablepassword: ['', [Validators.required, Validators.pattern(/^\S$|^\S[\s\S]*\S$/)]],
      ipaddress: [
        '',
        [
          Validators.required,
          Validators.pattern(
            '(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)'
          )
        ]
      ],
      adminaccount: ['', [Validators.required, Validators.pattern(/^\S$|^\S[\s\S]*\S$/)]]
    });

    this.enableFormAWS = this.formBuilder.group({
      accesskey: [
        '',
        [
          Validators.required,
          Validators.minLength(16),
          Validators.maxLength(128),
          Validators.pattern(/^\S$|^\S[\s\S]*\S$/)
        ]
      ],
      secretaccesskey: ['', [Validators.required, Validators.pattern(/^\S$|^\S[\s\S]*\S$/)]],
      region: ['', [Validators.required, Validators.pattern(/^\S$|^\S[\s\S]*\S$/)]]
    });

    this.enableFormwlc = this.formBuilder.group({
      vendorOne: this.formBuilder.group({
        wlcusername: ['', [Validators.required, Validators.pattern(/^\S$|^\S[\s\S]*\S$/)]],
        wlcpassword: ['', [Validators.required, Validators.pattern(/^\S$|^\S[\s\S]*\S$/)]],
        wlcipaddress: [
          '',
          [
            Validators.required,
            Validators.pattern(
              '(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)'
            )
          ]
        ]
      }),
      vendorTwo: this.formBuilder.group({
        wlcaccessid: [null, [Validators.required, Validators.pattern(/^\S$|^\S[\s\S]*\S$/)]],
        wlcpath: [null]
      }),
      vendorThree: this.formBuilder.group({
        wlcusername: ['', [Validators.required, Validators.pattern(/^\S$|^\S[\s\S]*\S$/)]],
        wlcpassword: ['', [Validators.required, Validators.pattern(/^\S$|^\S[\s\S]*\S$/)]],
        wlcurl: ['', [Validators.required, Validators.pattern(/^\S$|^\S[\s\S]*\S$/)]]
      }),
    });
    //wlcurl: [null, [Validators.required, Validators.pattern(/^(http:\/\/|https:\/\/)?(www.)?([a-zA-Z0-9]+).[a-zA-Z0-9]*.[a-z]{3}.?([a-z]+)?$/)]]
    this.editForm = this.formBuilder.group({
      ldesce: [
        '',
        [Validators.required, Validators.maxLength(100), Validators.pattern(/^\S$|^\S[\s\S]*\S$/)]
      ],
      country: ['', [Validators.required, Validators.pattern(/^\S$|^\S[\s\S]*\S$/)]],
      region: ['', [Validators.pattern(/^\S$|^\S[\s\S]*\S$/)]],
      timezone: ['', [Validators.pattern(/^\S$|^\S[\s\S]*\S$/)]],
      city: ['', [Validators.required, Validators.pattern(/^\S$|^\S[\s\S]*\S$/)]],
      longitude: ['', [Validators.pattern(/^\S$|^\S[\s\S]*\S$/)]],
      latitude: ['', [Validators.pattern(/^\S$|^\S[\s\S]*\S$/)]]
      // streaming:['',[Validators.required,Validators.min(1),Validators.max(99),Validators.pattern("^[0-9]*$")]]
    });
  }

  // convenience getter for easy access to form fields
  get f() {
    return this.changepasswordForm.controls;
  }
  get s() {
    return this.enableForm.controls;
  }
  get e() {
    return this.editForm.controls;
  }
  get a() {
    return this.enableFormAWS.controls;
  }
  get b() {
    return this.enableFormwlc.controls;
  }

  get fone() {
    return (<FormGroup>this.enableFormwlc.get('vendorOne')).controls;
  }
  get fc() {
    return (<FormGroup>this.enableFormwlc.get('vendorTwo')).controls;
  }

  get fthree() {
    return (<FormGroup>this.enableFormwlc.get('vendorThree')).controls;
  }

  // ----------------------

  get vendorOne() {
    return this.enableFormwlc.get('vendorOne');
  }
  get vendorTwo() {
    return this.enableFormwlc.get('vendorTwo');
  }
  get vendorThree() {
    return this.enableFormwlc.get('vendorThree');
  }

  public change_venderlist(e) {
    this.model.vendor = e.value.name;
    this.wlcFormSelector(e.value.name);
    // console.log(this.model);
  }

  public wlcFormSelector(vendorname: string) {
    // disable the previous form error msg
    this.vendorOneSubmitted = false;
    this.vendorTwoSubmitted = false;
    this.vendorThreeSubmitted = false;
    this.sshNote = vendorname == 'cisco' ? true : false;

    if (vendorname === 'cisco' || vendorname === 'aruba') {
      this.isJuniperSelected = false;
      this.isSolarSelected = false;
      this.isCiscoSelected = true;
    } else if (vendorname === 'cisco meraki') {
      this.isSolarSelected = false;
      this.isJuniperSelected = true;
      this.isCiscoSelected = false;
    } else if (vendorname === 'solar winds' || vendorname === 'hp imc') {
      this.isSolarSelected = true;
      this.isJuniperSelected = false;
      this.isCiscoSelected = false;
    } else {
      this.isSolarSelected = false;
      this.isJuniperSelected = false;
      this.isCiscoSelected = true;
    }
  }

  // Getter method to access formcontrols
  get vendor() {
    return this.enableFormwlc.get('vendor');
  }

  // option_enable_ad(value: string) {
  //   if (value == 'enable') {
  //     this.Current_option_ad = 1;
  //     this.ad_status = 1;
  //   } else {
  //     this.Current_option_ad = 0;
  //     this.ad_status = 0;
  //   }
  // }

  option_enable_aws(value) {
    if (value == 'enable') {
      this.Current_option_aws = 1;
      this.aws_status = 1;
    } else {
      this.Current_option_aws = 0;
      this.aws_status = 0;
    }
  }

  option_user_type(value) {
    if (value == 'admin') {
      this.changepassword_type = 'admin';
    } else if (value == 'customer') {
      this.changepassword_type = 'customer';
    }
  }

  Customer_info: any = [];

  customer_details_list(id) {
    if (id == 1) {
      this.license = [];
      this.license = JSON.parse(localStorage.getItem('l_key'));
      this.model.licence_desc = this.license[0].desc;
      this.Current_license = Object.keys(this.New_License[0])[0];
    } else {
      this.setting_values = JSON.parse(atob(localStorage.getItem('customer_details')));
      if (localStorage.getItem('setting_customer_id') == '0') {
        // console.log("admin")
        if (localStorage.getItem('customer_id') == '0') {
          this.Current_customer_id == parseInt(this.setting_values[0].id);
        } else {
          this.Current_customer_id = parseInt(localStorage.getItem('customer_id'));
        }
        this.New_License = [];
        this.license = [];
        if (this.setting_values[0].license != undefined) {
          this.New_License.push(
            this.setting_values.filter(x => x.id == this.Current_customer_id)[0].license
          );
          var details = this.New_License;
        }
        for (var i in details) {
          for (var j in details[i]) {
            this.license.push({ subnet: j, desc: details[i][j] });
            localStorage.setItem('l_key', JSON.stringify(this.license));
          }
        }

        this.license = JSON.parse(localStorage.getItem('l_key'));
        this.model.licence_desc = this.license[0].desc;
        this.Current_license = Object.keys(this.New_License[0])[0];
      } else {
        // console.log("customer")
        this.Current_customer_id = parseInt(localStorage.getItem('setting_customer_id'));
        this.New_License = [];
        this.license = [];
        this.New_License.push(
          this.setting_values.filter(x => x.id == this.Current_customer_id)[0].license
        );

        var details = this.New_License;
        for (var i in details) {
          for (var j in details[i]) {
            this.license.push({ subnet: j, desc: details[i][j] });
            localStorage.setItem('l_key', JSON.stringify(this.license));
          }
        }
        this.license = JSON.parse(localStorage.getItem('l_key'));
        this.Current_license = Object.keys(this.New_License[0])[0];
        this.model.licence_desc = Object.values(this.New_License[0])[0];
      }

      if (window.innerHeight > 900) {
        this.change_innerHeight = (window.innerHeight - 100) * 0.58 + 'px';
        this.change_innerHeight_div = (window.innerHeight - 100) * 0.6 + 'px';
        this.table_height = '500px';
      } else {
        this.change_innerHeight = (window.innerHeight - 100) * 0.68 + 'px';
        this.change_innerHeight_div = (window.innerHeight - 100) * 0.72 + 'px';
        this.table_height = '200px';
      }
    }
  }

  scrollToBottom_log(): void {
    try {
      if (localStorage.getItem('logUpdate_log') === '1') {
        this.myScrollContainerlog.nativeElement.scrollTop = this.myScrollContainerlog.nativeElement.scrollHeight;
        this.renderer.setStyle(this.myScrollContainerlog.nativeElement, 'overflow-y', 'hidden');
      } else {
        // console.log('Manual scrolling');
        this.renderer.setStyle(this.myScrollContainerlog.nativeElement, 'overflow-y', 'scroll');
      }
      // console.log(this.myScrollContainerlog.nativeElement.scrollTop, "--- 3 ");
    } catch (err) {
      // console.log('scroll');
    }
  }

  scrollToBottom_tie(): void {
    try {
      if (localStorage.getItem('logUpdate_tie') === '1') {
        this.myScrollContainertie.nativeElement.scrollTop = this.myScrollContainertie.nativeElement.scrollHeight;
        this.renderer.setStyle(this.myScrollContainertie.nativeElement, 'overflow-y', 'hidden');
      } else {
        // console.log('Manual scrolling');
        this.renderer.setStyle(this.myScrollContainertie.nativeElement, 'overflow-y', 'scroll');
      }
      // console.log(this.myScrollContainertie.nativeElement.scrollTop, "--- 3 ");
    } catch (err) {
      // console.log('scroll');
    }
  }

  updateModuleLog_log(loginfo_log) {
    this.dataLoading = true;
    this.logger_log = '';
    this.logger_log = loginfo_log;
  }

  updateModuleLog_tie(loginfo_tie) {
    this.dataLoading = true;
    this.logger_tie = '';
    this.logger_tie = loginfo_tie;
  }

  licencse_update(name) {
    this.selected_path = name;
    if (this.selected_path == 'setting') {
      this.ip_address_load();
    } else if (this.selected_path == 'aws') {
      this.asset_config_status = '';
      this.aws_config();
    } else if (this.selected_path == 'adc') {
      this.ad_config();
    } else if (this.selected_path == 'wlc') {
      this.wlc_config();
    } else if (this.selected_path == 'user') {
      this.usermgt_config();
    }
    this.selected_path = '';
  }

  header_dropdown_click() {
    this.headerEvent = this.intercomm.getheaderdropdownClicked().subscribe(info => {
      if (info == true) {
        this.Current_customer_id = parseInt(localStorage.getItem('customer_id'));
        // tslint:disable-next-line: radix
        this.Current_customer_name = localStorage.getItem('customer_name');
        this.New_License = [];
        this.New_License.push(
          this.setting_values.filter(x => x.id == localStorage.getItem('customer_id'))[0].license
        );
        this.Current_license = Object.keys(this.New_License[0])[0];
        this.model.licence_desc = Object.values(this.New_License[0])[0];
        this.customer_details_list(0);
        if (this.active_list == 'setting') {
          this.ip_address_load();
        } else if (this.active_list == 'email') {
          this.email_notify_load(2);
        } else if (this.active_list == 'licence') {
          this.management_load();
        } else if (this.active_list == 'ad') {
          this.ad_config();
        } else if (this.active_list == 'aws') {
          this.asset_config_status = '';
          this.aws_config();
        } else if (this.active_list == 'wlc') {
          this.wlc_config();
        } else if (this.active_list == 'user') {
          this.usermgt_config();
        }
      }
    });
  }

  onChange_license(data) {
    this.model.licence_desc = data.value.desc;
    this.Current_license = data.value.subnet;
    this.ip_address_load();
  }

  onChange_ad(data) {
    this.Current_license = '';
    this.model.licence_desc = data.value.desc;
    this.Current_license = data.value.subnet;
    this.ad_config();
  }

  onChange_wlc(data) {
    this.model.licence_desc = data.value.desc;
    this.Current_license = data.value.subnet;
    this.clear();
    this.selectedVender = { name: '' };
    this.wlc_config();
  }

  autoRefreshlog(check) {
    if (check === true) {
      this.isAutoUpdateChecked_log = true;
      localStorage.setItem('logUpdate_log', '1');
    } else {
      this.isAutoUpdateChecked_log = false;
      localStorage.setItem('logUpdate_log', '0');
    }
  }

  autoRefreshtie(check) {
    if (check === true) {
      this.isAutoUpdateChecked_tie = true;
      localStorage.setItem('logUpdate_tie', '1');
    } else {
      this.isAutoUpdateChecked_tie = false;
      localStorage.setItem('logUpdate_tie', '0');
    }
  }

  notify(id: number) {
    this.notify_test = id;
    this.active_list = 'email';
  }

  loadNode(event) {
    //  console.log(event);
  }

  applyFilter_log() {
    this.FilterSelect = +this.FilterSelect;
    if (this.FilterSelect === 0) {
      var parameter_log = {
        moduleName: this.selectname_log,
        nol: 25,
        token: localStorage.getItem('token')
      };
    } else if (this.FilterSelect === 1) {
      var parameter_log = {
        moduleName: this.selectname_log,
        nol: 50,
        token: localStorage.getItem('token')
      };
    } else if (this.FilterSelect === 2) {
      var parameter_log = {
        moduleName: this.selectname_log,
        nol: 75,
        token: localStorage.getItem('token')
      };
    } else if (this.FilterSelect === 3) {
      var parameter_log = {
        moduleName: this.selectname_log,
        nol: 100,
        token: localStorage.getItem('token')
      };
    }
    this.socketdataService.requestModuleLog(parameter_log);
  }

  applyFilter_tie() {
    this.FilterSelect = +this.FilterSelect;
    if (this.FilterSelect === 0) {
      var parameter_tie = {
        moduleName: this.selectname_tie,
        nol: 25,
        token: localStorage.getItem('token')
      };
    } else if (this.FilterSelect === 1) {
      var parameter_tie = {
        moduleName: this.selectname_tie,
        nol: 50,
        token: localStorage.getItem('token')
      };
    } else if (this.FilterSelect === 2) {
      var parameter_tie = {
        moduleName: this.selectname_tie,
        nol: 75,
        token: localStorage.getItem('token')
      };
    } else if (this.FilterSelect === 3) {
      var parameter_tie = {
        moduleName: this.selectname_tie,
        nol: 100,
        token: localStorage.getItem('token')
      };
    }
    this.socketdataService.requestModuleLog(parameter_tie);
  }

  collape(val) {
    this.closeNav();
    this.customer_details_list(1);
    if (val == 'log') {
      this.active_list = 'log';
      this.FilterSelect = 3;
    } else if (val == 'setting') {
      this.active_list = 'setting';
      this.licencse_update('setting');
      this.SettingsLoading = true;
    } else if (val == 'email') {
      this.active_list = 'email';
      this.email_notify_load(2);
      this.SettingsLoading = true;
    } else if (val == 'licence') {
      this.active_list = 'licence';
      this.management_load();
      this.SettingsLoading = true;
    } else if (val == 'ad') {
      this.active_list = 'ad';
      this.licencse_update('adc');
      this.SettingsLoading = true;
    } else if (val == 'aws') {
      this.active_list = 'aws';
      this.licencse_update('aws');
      this.SettingsLoading = true;
    } else if (val == 'changepassword') {
      this.clear();
      this.active_list = 'changepassword';
      this.model.oldpassword = '';
      this.type = 'password';
      this.type1 = 'password';
      this.type2 = 'password';
      this.type3 = 'password';
    } else if (val === 'wlc') {
      this.active_list = 'wlc';
      this.licencse_update('wlc');
      this.SettingsLoading = true;
    } else if (val == 'dateformat') {
      this.active_list = 'dateformat';
    } else if (val == 'tie') {
      this.active_list = 'tie';
    } else if (val === 'user') {
      this.active_list = 'user';
      this.licencse_update('user');
    }
  }

  ad_config() {
    var current_details = {
      config: 6,
      token: localStorage.getItem('token'),
      customer_id: this.Current_customer_id,
      licence_key: this.Current_license
    };
    this.socketdataService.requestSettings(current_details);
  }


  aws_config() {
    var current_details = {
      config: 5,
      token: localStorage.getItem('token'),
      customer_id: this.Current_customer_id,
      licence_key: this.Current_license
    };
    this.socketdataService.requestSettings(current_details);
  }


  isEmptyObject(obj) {
    for (var key in obj) {
      if (Object.prototype.hasOwnProperty.call(obj, key)) {
        return false;
      }
    }
    return true;
  }

  ad_add_btn: any;
  public get_JSON() {
    this.aws_configuration = [];
    this.ad_configuration = [];
    this.socketdataService.getSettings().subscribe(info => {
      this.SettingsLoading = false;
      this.val2 = 'ENABLE';
      this.Current_option_aws = 1;
      this.wlcListLoading = true;

      if (this.isEmpty(info)) {
        this.wlc = [];
      } else {
        // user  management handling
        if (info['config'] === 8) {
          this.userMgtList = [];
          if (this.isEmpty(info['userInfo'])) {
            this.userMgtList = [];
          } else {
            // tslint:disable-next-line: forin
            for (let i in info['userInfo']) {
              const userObj = {
                username: info['userInfo'][i].username,
                customer_name: info['userInfo'][i].customer_name,
                adminuser: info['user'],
                isAdminUser: info['userInfo'][i].hasOwnProperty('isAdminUser') ? false : true,
                isSameLogin: info['user'] == info['userInfo'][i].username ? true : false,
                role: info['userInfo'][i].role
              };
              this.userMgtList.push(userObj);
            }
          }
        } else if (info['config'] == 5) {
          let data1 = info['assetConfig'];
          if (this.isEmpty(info['assetConfig'])) {
            this.asset = [];
          } else {
            if (this.asset_config_status == 'create') {
              this.val2 = 'ENABLE';
              this.Current_option_aws = 1;
              this.model.accesskey = '';
              this.model.secretaccesskey = '';
              this.model.region = '';
            } else if (this.asset_config_status == 'edit') {
              if (this.asset_edited_value['status'] == 'ENABLE') {
                this.val2 = 'ENABLE';
                this.Current_option_aws = 1;
              } else {
                this.val2 = 'DISABLE';
                this.Current_option_aws = 0;
              }
              this.aws_configuration = data1[this.asset_edited_value['asset_id']]['config'];
              this.model.accesskey =
                this.aws_configuration == undefined ? '-' : this.aws_configuration.aws_key_id;
              this.model.secretaccesskey =
                this.aws_configuration == undefined ? '-' : this.aws_configuration.secret_key;
              this.model.region =
                this.aws_configuration == undefined ? '-' : this.aws_configuration.aws_region;
            } else {
              this.assetList = [];
              this.asset = [];
              for (var i in info['assetConfig']) {
                var object_val = i;
                this.aws_status = data1[object_val]['status'];
                if (this.aws_status == 1) {
                  this.val2 = 'ENABLE';
                  this.Current_option_aws = 1;
                } else {
                  this.val2 = 'DISABLE';
                  this.Current_option_aws = 0;
                }

                this.aws_configuration = data1[object_val]['config'];
                this.model.accesskey =
                  this.aws_configuration == undefined ? '-' : this.aws_configuration.aws_key_id;
                this.model.secretaccesskey =
                  this.aws_configuration == undefined ? '-' : this.aws_configuration.secret_key;
                this.model.region =
                  this.aws_configuration == undefined ? '-' : this.aws_configuration.aws_region;

                if (data1[object_val]['isDeleted'] != true) {
                  this.assetList.push({
                    asset_id: object_val,
                    status: this.val2,
                    aws_access_key_id: data1[object_val]['config'].aws_key_id,
                    aws_secret_key: data1[object_val]['config'].secret_key,
                    aws_region: data1[object_val]['config'].aws_region
                  });
                }

                this.asset = this.assetList;
              }
            }
          }
        } else if (info['config'] == 6) {

          this.adconfigList = [];
          var data = info['adConfig'];
          this.ad_status = data['status'];

          if (data['status'] == 0 && this.isEmptyObject(data['config'])) {
            this.ad_add_btn = 1;
            this.Current_option_ad = 1;
            this.adconfig = [];
          } else {

            if (this.ad_status == 1) {
              this.val1 = 'ENABLE';
              this.Current_option_ad = 1;
            } else {
              this.val1 = 'DISABLE';
              this.Current_option_ad = 0;
            }

            this.ad_configuration = data.config;
            this.model.username =
              this.ad_configuration == undefined ? '-' : this.ad_configuration.domain_name;
            this.model.enablepassword =
              this.ad_configuration == undefined ? '-' : this.ad_configuration.pwd;
            this.model.ipaddress =
              this.ad_configuration == undefined ? '-' : this.ad_configuration.host_name;
            this.model.adminaccount =
              this.ad_configuration == undefined ? '-' : this.ad_configuration.dn_admin_account;
            this.adconfigList.push({
              status: this.val1,
              domain_name: this.model.username,
              ip_address: this.model.ipaddress,
              admin_account: this.model.adminaccount,
              pwd: this.model.enablepassword
            });
            this.ad_add_btn = 0;
            this.adconfig = this.adconfigList;
          }

        } else if (info['config'] == 4) {
          this.isGlDisabled = false;
          var details = info;
          this.liscensmanagement = details['license'];
          this.license = [];

          // tslint:disable-next-line:forin
          for (var j in this.liscensmanagement) {
            this.license.push({
              subnet: this.liscensmanagement[j].licence_key,
              desc: this.liscensmanagement[j].licence_desc
            });
          }

          localStorage.setItem('l_key', JSON.stringify(this.license));
          this.license = [];
          this.license = JSON.parse(localStorage.getItem('l_key'));

        } else if (info['config'] == 1) {
          this.SettingsLoading = false;
          this.subnetList_ip = [];

          for (var i in [info['subnetList']]) {
            for (var j in [info['subnetList']][i]) {
              this.subnetList_ip.push({ subnet: j, desc: [info['subnetList']][i][j] });
            }
          }
          this.subnet = this.subnetList_ip;
        } else if (info['config'] == 7) {
          this.venderlist = [];
          this.wlc = [];

          //  collect the vendor list frmo response
          // tslint:disable-next-line: forin
          for (var i in info['venderlist']) {
            var details1 = { name: info['venderlist'][i] };
            this.venderlist.push(details1);
          }
          this.selectedVender = this.venderlist[0];

          if (this.isEmpty(info['wlcConfig'])) {
            this.StoredAccessKeyList = [];
            this.StoredIPAddressList = [];
          } else {
            this.StoredAccessKeyList = [];
            this.StoredIPAddressList = [];
            // tslint:disable-next-line: forin
            for (var i in info['wlcConfig']) {
              if (info['wlcConfig'][i].accesskey) {
                this.StoredAccessKeyList.push(info['wlcConfig'][i].accesskey);
              }

              if (info['wlcConfig'][i].ipaddress) {
                this.StoredIPAddressList.push(info['wlcConfig'][i].ipaddress);
              }

              const json = {
                wlc_id: i,
                vendor: info['wlcConfig'][i].vendor,
                ipaddress: info['wlcConfig'][i].ipaddress,
                username: info['wlcConfig'][i].username,
                password: info['wlcConfig'][i].password,
                accesskey: info['wlcConfig'][i].accesskey,
                path: info['wlcConfig'][i].path,
                url: info['wlcConfig'][i].url
              };
              this.wlc.push(json);
            }

            this.wlcListLoading = false;
          }
        } else if (info['config'] == 3) {
          this.subnetList_email = [];
          var data = info['emailList'];
          for (var i in data) {
            this.subnetList_email.push({ emailid: data[i] });
          }
          this.emailreport = this.subnetList_email;
        } else if (info['config'] == 14) {
          this.upgrade_popup = true;
        }
      }
    });
  }
  management_load() {
    var current_details = {
      config: 4,
      token: localStorage.getItem('token'),
      customer_id: this.Current_customer_id
    };
    this.socketdataService.requestSettings(current_details);
  }

  ip_address_load() {
    var current_details = {
      config: 1,
      token: localStorage.getItem('token'),
      customer_id: this.Current_customer_id,
      licence_key: this.Current_license
    };
    this.socketdataService.requestSettings(current_details);
  }

  isEmpty(obj) {
    // check for empty object
    for (let key in obj) {
      if (obj.hasOwnProperty(key)) {
        return false;
      }
    }
    return true;
  }

  /**  Fn AccessKey Check */
  public FnAccessKeyCheck(accesskey: any) {


    if (this.isWlcEditEnabled && accesskey == this.old_accesskey) {
      this.errorMsgAccessKeyDuplicate = '';
      this.isAccesskeyErDuplicated = false;
      return true;
    } else if (this.StoredAccessKeyList.includes(accesskey)) {
      this.isAccesskeyErDuplicated = true;
      this.errorMsgAccessKeyDuplicate = 'Enter a unique Access key';
      return false;
    } else {
      this.errorMsgAccessKeyDuplicate = '';
      this.isAccesskeyErDuplicated = false;
      return true;
    }
  }

  /**  Fn IP Address Check */
  public FnIPAddressCheck(ipaddress: any) {
    if (this.isWlcEditEnabled && ipaddress == this.old_ipaddress) {
      this.errorMsgIPAddressDuplicate = '';
      this.isIPAddressErDuplicated = false;
      return true;
    } else if (this.StoredIPAddressList.includes(ipaddress)) {
      this.isIPAddressErDuplicated = true;
      this.errorMsgIPAddressDuplicate = 'Enter a unique ip address';
      return false;
    } else {
      this.errorMsgIPAddressDuplicate = '';
      this.isIPAddressErDuplicated = false;
      return true;
    }
  }



  wlc_config() {
    var current_details = {
      config: 7,
      token: localStorage.getItem('token'),
      customer_id: this.Current_customer_id,
      licence_key: this.Current_license
    };
    this.socketdataService.requestSettings(current_details);
  }

  public usermgt_config() {
    const current_details = {
      config: 8,
      token: localStorage.getItem('token'),
      customer_id: this.Current_customer_id,
      licence_key: this.Current_license
    };
    this.socketdataService.requestSettings(current_details);
  }

  email_notify_load(ids) {
    if (ids == 1) {
      var current_details = {
        config: 2,
        token: localStorage.getItem('token'),
        customer_id: this.Current_customer_id
      };
    } else if (ids == 2) {
      var current_details = {
        config: 3,
        token: localStorage.getItem('token'),
        customer_id: this.Current_customer_id
      };
    }
    this.socketdataService.requestSettings(current_details);
  }

  adding_email(id) {
    var getemail = this.model.email.toLowerCase();

    var local = getemail.substring(0, getemail.lastIndexOf('@'));
    var domainpart = getemail.substring(getemail.lastIndexOf('@') + 1);
    var dot = domainpart.substring(0, domainpart.lastIndexOf('.'));

    // tslint:disable-next-line: max-line-length
    const expression = /(?!.*\.{2})^([a-z\d!#$%&'*+\-\/=?^_`{|}~\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF]+(\.[a-z\d!#$%&'*+\-\/=?^_`{|}~\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF]+)*|"((([ \t]*\r\n)?[ \t]+)?([\x01-\x08\x0b\x0c\x0e-\x1f\x7f\x21\x23-\x5b\x5d-\x7e\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF]|\\[\x01-\x09\x0b\x0c\x0d-\x7f\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF]))*(([ \t]*\r\n)?[ \t]+)?")@(([a-z\d\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF]|[a-z\d\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF][a-z\d\-._~\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF]*[a-z\d\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])\.)+([a-z\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF]|[a-z\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF][a-z\d\-._~\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF]*[a-z\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])\.?$/i;

    if (local.length > 64) {
      this.emailerrormsg = 'Local part of the email may not be greater than 64 characters ';
    } else if (dot.length > 255) {
      this.emailerrormsg = 'Domain part of the email may not be greater than 255 characters';
    } else if (local.length > 64 && dot.length > 255) {
      this.emailerrormsg =
        'Local part of the email may not be greater than 64 characters and Domain part of the email may not be greater than 255 characters';
    } else if (expression.test(String(getemail).toLowerCase())) {
      if (id == 1) {
        var cutrrent_email = {
          config: 3,
          token: localStorage.getItem('token'),
          customer_id: this.Current_customer_id,
          emailAddress: getemail
        };

        this.socketdataService.saveSettings(cutrrent_email);

        this.response_toast('email_save');
        this.email_popup = false;

        this.emailerrormsg = '';
        this.model.email = '';
      } else if (id == 2) {

        let emailIsAvailable = false;

        this.emailreport.map(email => {
          if (email.emailid == getemail) {
            emailIsAvailable = true;
          }
        });

        if (emailIsAvailable) {
          this.toastr.error("Email id already exists");
          this.email_popup = false;

          this.emailerrormsg = '';
          this.model.email = '';
        } else {
          var cutrrent_email = {
            config: 5,
            token: localStorage.getItem('token'),
            customer_id: this.Current_customer_id,
            emailAddress: getemail
          };

          this.socketdataService.saveSettings(cutrrent_email);

          this.response_toast('email_save');
          this.email_popup = false;

          this.emailerrormsg = '';
          this.model.email = '';
        }
      }
    } else {
      this.showAddEmailBtn = false;
      this.emailerrormsg = 'Please enter a valid email address ';
    }
  }

  response_toast(value) {
    this.result = value;
    this.socketdataService.getsaveSettings().subscribe(data => {
      if (this.result == 'email_save') {
        if (data == true) {
          this.toastr.info('Email-id saved successfully');
          this.email_notify_load(2);
          this.result = '';
        } else {
          this.toastr.error('Failed to save email-id');
          this.result = '';
        }
      } else if (this.result == 'email_remove') {
        if (data == true) {
          this.toastr.info('Email-id removed successfully');
          this.email_notify_load(2);
          this.result = '';
        } else {
          this.toastr.error('Failed to remove email-id');
        }
      } else if (this.result == 'subnet_save') {
        if (data == true) {
          this.toastr.info('Subnet address saved successfully');
          this.ip_address_load();
          this.clear();
          this.Current_page = '';
          this.result = '';
        } else {
          this.toastr.error('Failed to save subnet address');
          this.result = '';
          this.clear();
        }
      } else if (this.result == 'subnet_remove') {
        if (data == true) {
          this.toastr.info('Subnet address removed successfully');
          this.clear();
          this.ip_address_load();
          this.result = '';
        } else {
          this.toastr.error('Failed to remove subnet address');
          this.result = '';
        }
      } else if (this.result == 'subnet_update') {
        if (data == true) {
          this.toastr.info('Subnet address updated successfully');
          this.clear();
          this.ip_address_load();
          this.Current_page = '';
          this.result = '';
        } else {
          this.toastr.error('Failed to update subnet address');
          this.result = '';
        }
      } else if (this.result == 'ad_save') {
        if (data == true) {
          this.toastr.info('AD configuration saved successfully');
          this.ad_config();
          this.ad_popup = false;
          this.result = '';
        } else {
          this.toastr.error('Failed save AD configuration');
          this.result = '';
        }
      } else if (this.result == 'aws_save') {
        if (data == true) {
          this.toastr.info('AWS configuration saved successfully');
          this.asset_config_status = '';
          this.aws_config();
          this.aws_popup = false;
          this.awssubmit = false;
          this.result = '';
          this.clear();
        } else {
          this.toastr.error('Failed save AWS configuration');
          this.result = '';
          this.clear();
        }
      } else if (this.result == 'aws_edit') {
        if (data == true) {
          this.toastr.info('AWS configuration updated successfully');
          this.asset_config_status = '';
          this.aws_config();
          this.aws_popup = false;
          this.awssubmit = false;
          this.result = '';
        } else {
          this.toastr.error('Failed to update AWS configuration');
          this.result = '';
          this.clear();
        }
      } else if (this.result == 'aws_delete') {
        if (data == true) {
          this.toastr.info('AWS configuration removed successfully');
          this.asset_config_status = '';
          this.aws_config();
          this.aws_popup = false;
          this.awssubmit = false;
          this.result = '';
        } else {
          this.toastr.error('Failed to update AWS configuration');
          this.result = '';
          this.clear();
        }
      } else if (this.result == 'licence_update') {
        if (data == true) {
          this.toastr.info('License updated successfully');
          this.edit_popup = false;
          this.edited = false;
          this.management_load();
          this.result = '';
        } else {
          this.toastr.error('Failed to update license');
          this.result = '';
        }
      } else if (this.result == 'licence_update_generate') {
        if (data == true) {
          this.toastr.info('License generated successfully');
          this.after_generate_licence();
          this.result = '';
        } else {
          this.isGlDisabled = false;
          this.toastr.error('Failed to generate license');
          this.result = '';
        }
      } else if (this.result == 'wlc_save') {
        if (data == true) {
          this.toastr.info('WLC configuration saved successfully');
          this.wlcsubmit = false;
          this.wlc_popup = false;
          this.wlc_config();
          this.clear();
          this.result = '';
        } else {
          this.toastr.error('Failed to save WLC configuration');
          this.result = '';
        }
      } else if (this.result == 'wlc_delete') {
        if (data == true) {
          this.toastr.info('WLC configuration removed successfully');
          this.wlcsubmit = false;
          this.wlc_popup = false;
          this.StoredAccessKeyList = [];
          this.StoredIPAddressList = [];
          this.wlc_config();
          this.clear();
          this.result = '';
        } else {
          this.toastr.error('Failed to remove WLC configuration');
          this.result = '';
        }
      } else if (this.result == 'env_save') {
        if (data == true) {
          this.toastr.info('Environment status updated successfully');
          this.management_load();
          this.result = '';
        } else {
          this.toastr.error('Failed to update environment status');
          this.result = '';
          this.clear();
        }
      } else if (this.result == 'user_save') {
        this.userMsg = true;
        if (data['status']) {
          this.toastr.info(data['msg']);
          this.usermgt_config();
        } else {
          this.toastr.error(data['msg']);
          this.result = '';

          this.clear();
          this.user_management_popup = false;
        }
      } else if (this.result == 'user_remove') {
        if (data == true) {
          this.toastr.info('User deleted successfully');
          this.usermgt_config();
        } else {
          this.toastr.error('Failed to delete User ');
          this.result = '';
          this.clear();
          this.user_management_popup = false;
        }
      }
    });
  }

  public emailfocusFn() {
    this.emailerrormsg = '';
  }

  public isValidEmail(event, emailvalue: any) {
    this.re = /(?!.*\.{2})^([a-z\d!#$%&'*+\-\/=?^_`{|}~\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF]+(\.[a-z\d!#$%&'*+\-\/=?^_`{|}~\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF]+)*|"((([ \t]*\r\n)?[ \t]+)?([\x01-\x08\x0b\x0c\x0e-\x1f\x7f\x21\x23-\x5b\x5d-\x7e\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF]|\\[\x01-\x09\x0b\x0c\x0d-\x7f\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF]))*(([ \t]*\r\n)?[ \t]+)?")@(([a-z\d\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF]|[a-z\d\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF][a-z\d\-._~\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF]*[a-z\d\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])\.)+([a-z\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF]|[a-z\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF][a-z\d\-._~\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF]*[a-z\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])\.?$/i;

    if (this.re.test(String(emailvalue).toLowerCase())) {
      this.showAddEmailBtn = true;
      this.emailerrormsg = '';
    } else {
      this.emailerrormsg = 'Please enter a valid email address ';
      this.showAddEmailBtn = false;
    }
  }
  public isValiddesc() {
    this.errormsg_desc = '';
  }
  email_remove(i, id) {
    if (id == 1) {
      var cutrrent_email_remove = {
        config: 4,
        token: localStorage.getItem('token'),
        customer_id: this.Current_customer_id,
        emailAddress: i.emailid
      };
    } else if (id == 2) {
      var cutrrent_email_remove = {
        config: 6,
        token: localStorage.getItem('token'),
        customer_id: this.Current_customer_id,
        emailAddress: i.emailid
      };
    }
    this.socketdataService.saveSettings(cutrrent_email_remove);
    this.response_toast('email_remove');
    this.email_notify_load(id);
  }
  public isMask(maskvalue) {
    this.ismaskvalue = /^\d+$/.test(maskvalue);
    if (this.ismaskvalue) {
      if (maskvalue > 32) {
        this.errormsg = 'Please enter a valid subnet ( <= 32)';
        this.SubnetVal5 = '';
      } else if (maskvalue === 0) {
        this.errormsg = 'Please enter a valid subnet(zero not allowed)';
        this.SubnetVal5 = '';
      }
    } else {
      this.errormsg = 'Please enter a valid number only';
      this.SubnetVal5 = '';
    }
  }

  public isNumber(value: any, text_id) {
    this.errormsg = '';
    this.isnum = /^\d+$/.test(value);
    if (this.isnum) {
      if (value > 255) {
        this.errormsg = 'Please enter a valid subnet ( <= 255)';
        if (text_id == 1) {
          this.SubnetVal1 = '';
        } else if (text_id == 2) {
          this.SubnetVal2 = '';
        } else if (text_id == 3) {
          this.SubnetVal3 = '';
        } else if (text_id == 4) {
          this.SubnetVal4 = '';
        }
      }
    } else {
      this.errormsg = 'Please enter a valid number only';
      if (text_id == 1) {
        this.SubnetVal1 = '';
      } else if (text_id == 2) {
        this.SubnetVal2 = '';
      } else if (text_id == 3) {
        this.SubnetVal3 = '';
      } else if (text_id == 4) {
        this.SubnetVal4 = '';
      }
    }
  }

  clearFilter(dropdown: Dropdown) {
    dropdown.resetFilter();
  }

  clear() {
    this.submitted = false;
    this.SubnetVal1 = '';
    this.SubnetVal2 = '';
    this.SubnetVal3 = '';
    this.SubnetVal4 = '';
    this.SubnetVal5 = '';
    this.model.username = '';
    this.model.enablepassword = '';
    this.model.ipaddress = '';
    this.model.adminaccount = '';
    this.model.subnet_desc = '';
    this.model.email = '';
    this.model.oldpassword = '';
    this.model.newpassword = '';
    this.model.confirmpassword = '';
    this.model.wlcipaddress = '';
    this.model.wlcusername = '';
    this.model.wlcurl = '';
    this.model.wlcpassword = '';
    this.model.wlcaccessid = '';
    this.model.wlcpath = '';
    this.model.accesskey = '';
    this.model.secretaccesskey = '';
    this.model.region = '';
    this.emailerrormsg = '';
    this.usernameerrormsg = '';
    this.usernamemsg = '';
    this.model.user_name = '';
    this.errormsg_desc = '';
    this.errormsg = '';
    this.type = 'password';
    this.submit = false;
    this.edited = false;
    this.awssubmit = false;
    this.wlcsubmit = false;
    this.asseterrormsg = '';
  }

  adding_ipaddress() {
    if (
      this.SubnetVal1 &&
      this.SubnetVal2 &&
      this.SubnetVal3 &&
      this.SubnetVal4 &&
      this.SubnetVal5
    ) {
      if (this.model.subnet_desc.trim()) {
        var ip_address =
          this.SubnetVal1 +
          '.' +
          this.SubnetVal2 +
          '.' +
          this.SubnetVal3 +
          '.' +
          this.SubnetVal4 +
          '/' +
          this.SubnetVal5;
        if (this.Current_page == 'edit') {
          var edit_subnet = {
            config: 9,
            token: localStorage.getItem('token'),
            customer_id: this.Current_customer_id,
            licence_key: this.Current_license,
            subnet: this.old_subnet,
            newsubnet: ip_address,
            desc: this.model.subnet_desc
          };
          this.socketdataService.saveSettings(edit_subnet);
          this.response_toast('subnet_update');
          this.ipaddress_popup = false;
        } else {
          var current_ipaddress = {
            config: 1,
            token: localStorage.getItem('token'),
            customer_id: this.Current_customer_id,
            licence_key: this.Current_license,
            subnet: ip_address,
            desc: this.model.subnet_desc
          };
          this.socketdataService.saveSettings(current_ipaddress);
          this.response_toast('subnet_save');
          this.ipaddress_popup = false;
        }
      } else {
        this.errormsg_desc = 'Please enter a description';
      }
    } else {
      this.errormsg = 'Please enter a valid subnet : xxx.xxx.xxx.xxx/xx';
    }
  }

  ipaddress_remove(i) {
    var current_ipaddress = {
      config: 2,
      token: localStorage.getItem('token'),
      customer_id: this.Current_customer_id,
      licence_key: this.Current_license,
      subnet: i.subnet
    };
    this.socketdataService.saveSettings(current_ipaddress);
    this.response_toast('subnet_remove');
  }

  ipaddress_edit(n, name) {
    this.subnet_status = name;
    var str = n.subnet;
    var splitted = str.split('.', 4);
    var ss = splitted[3];
    var splitted1 = ss.split('/', 2);

    this.model.subnet_desc = n.desc;

    this.SubnetVal1 = splitted[0];
    this.SubnetVal2 = splitted[1];
    this.SubnetVal3 = splitted[2];
    this.SubnetVal4 = splitted1[0];
    this.SubnetVal5 = splitted1[1];
    this.Current_page = 'edit';
    this.old_subnet = n.subnet;
    this.ipaddress_popup = true;
  }

  cloud_download(value) {
    window.open(value, '_blank');
  }

  downloadFile_windows(id) {
    if (this.isSettingsDownloadEnable == true) {
      const headers = new HttpHeaders().set('x-access-token', localStorage.getItem('token'));

      this.http
        .get(window.location.origin + '/ms/downloadwindowsbinary/v1/' + id, {
          responseType: 'arraybuffer',
          headers: headers
        })
        .subscribe(response => this.downLoadFile(response, 'application/zip'));
      this.buttonEnabled_windows = true;

      setTimeout(() => {
        this.buttonEnabled_windows = false;
      }, 2000);
    } else {
      this.toastr.info('At present download binary is supported only in laptops and desktops.');
    }
  }

  downloadFile_linux(id) {
    if (this.isSettingsDownloadEnable == true) {
      const headers = new HttpHeaders().set('x-access-token', localStorage.getItem('token'));

      this.http
        .get(window.location.origin + '/ms/downloadlinuxbinary/v1/' + id, {
          responseType: 'arraybuffer',
          headers: headers
        })
        .subscribe(response => this.downLoadFile(response, 'application/zip'));

      this.buttonEnabled_linux = true;

      setTimeout(() => {
        this.buttonEnabled_linux = false;
      }, 2000);
    } else {
      this.toastr.info('At present download binary is supported only in laptops and desktops.');
    }
  }

  downLoadFile(data: any, type: string) {
    var myBlob = new Blob([data], { type: type });
    var blobURL = window.URL.createObjectURL(myBlob);
    var anchor = document.createElement('a');
    anchor.download = 'ai3-deployment.zip';
    anchor.href = blobURL;
    document.body.appendChild(anchor);
    anchor.click();
  }

  reset(value) {
    if (this.user_id == 0) {
      this.restService
        .reset(value)
        .then(data => {
          this.toastr.info(data['MSG']);
        })
        .catch(err => {
          console.log('Error Msg ', err.error['ERROR']);
        });
    } else {
      this.reset_popup = true;
    }
  }

  licence_location: any = [];
  info_location(details) {
    this.licence_location = [];
    this.location_popup = true;
    if (details != undefined) {
      this.licence_location.push(details);
    }
  }

  edit_location(lm) {
    this.edit_popup = true;
    this.Current_license = lm.licence_key;
    this.model.licence_desc = lm.licence_desc == undefined ? '' : lm.licence_desc;
    this.model.country = lm.licence_location == undefined ? '' : lm.licence_location.country;
    this.model.region = lm.licence_location == undefined ? '' : lm.licence_location.region;
    this.model.timezone = lm.licence_location == undefined ? '' : lm.licence_location.timezone;
    this.model.city = lm.licence_location == undefined ? '' : lm.licence_location.city;
    this.model.longitude = lm.licence_location == undefined ? '' : lm.licence_location.ll[1];
    this.model.latitude = lm.licence_location == undefined ? '' : lm.licence_location.ll[0];
  }

  license_desc_value: any;
  description_popup(lm) {
    this.desc_popup = true;
    var val = lm.licence_desc.trim();
    if (val.length == 0) {
      this.license_desc_value = 'NO DATA AVAILABLE';
    } else {
      this.license_desc_value = lm.licence_desc;
    }
  }

  close_desc() {
    this.desc_popup = false;
  }

  close_reset() {
    this.reset_popup = false;
  }

  close_upgrade() {
    this.upgrade_popup = false;
  }

  open_upgrade() {
    var current_ipaddress = {
      config: 14,
      token: localStorage.getItem('token'),
      customer_id: this.Current_customer_id,
      licence_key: this.Current_license
    };
    this.socketdataService.saveSettings(current_ipaddress);
  }

  close_location() {
    this.location_popup = false;
  }

  close_edit() {
    this.edit_popup = false;
    this.edited = false;
  }

  edit_update() {
    this.edited = true;
    if (this.editForm.invalid) {
      return;
    }
    var edit_details = {
      config: 1,
      token: localStorage.getItem('token'),
      customer_id: this.Current_customer_id,
      licence_key: this.Current_license,
      license_desc: this.model.licence_desc,
      licence_location: {
        range: '',
        country: this.model.country,
        region: this.model.region,
        eu: '',
        timezone: this.model.timezone,
        city: this.model.city,
        ll: [this.model.latitude, this.model.longitude],
        metro: '',
        area: ''
      }
    };
    this.socketdataService.saveSettings(edit_details);

    this.license = JSON.parse(localStorage.getItem('l_key'));
    for (var i in this.license) {
      if (this.license[i].subnet == this.Current_license) {
        const update_value = {
          subnet: this.Current_license,
          desc: this.model.licence_desc
        };
        this.license.find(l => l.subnet == update_value.subnet).desc = update_value.desc;
        localStorage.setItem('l_key', JSON.stringify(this.license));
      }
    }
    this.license = [];
    this.license = JSON.parse(localStorage.getItem('l_key'));
    this.response_toast('licence_update');
  }

  change_password() {
    this.submitted = true;
    if (this.changepasswordForm.invalid) {
      return;
    }

    var change_password_json1 = {
      oldPwd: this.model.oldpassword,
      newPwd: this.model.newpassword,
      token: localStorage.getItem('token'),
      customer_id: this.Current_customer_id
    };
    this.socketdataService.setchangePassword(change_password_json1);

    this.socketdataService.getchangePassword().subscribe(data => {
      if (data == true) {
        this.toastr.info('Updated successfully');
        this.submitted = false;
        this.model.oldpassword = '';
        this.model.newpassword = '';
        this.model.confirmpassword = '';
      } else {
        this.toastr.error('Password entered is incorrect');
      }
    });
  }

  ADenable_details() {
    this.submit = true;
    if (this.enableForm.invalid) {
      return;
    }

    var ad_config = {
      configuration: {
        domain_name: this.model.username,
        pwd: this.model.enablepassword,
        host_name: this.model.ipaddress,
        dn_admin_account: this.model.adminaccount
      },
      status: this.Current_option_ad,
      licence_key: this.Current_license,
      config: 7,
      token: localStorage.getItem('token')
    };

    this.socketdataService.saveSettings(ad_config);
    this.response_toast('ad_save');
  }

  env_option_status: any;
  toggle_status_env(val) {
    if (val != undefined) {
      if (val == true) {
        this.env_option_status = false;
      } else if (val == false) {
        this.env_option_status = true;
      }

      var env_config = {
        isEnvironment_state: this.env_option_status,
        licence_key: this.Current_license,
        config: 1,
        customer_id: this.Current_customer_id,
        token: localStorage.getItem('token')
      };

      this.socketdataService.saveSettings(env_config);
      this.response_toast('env_save');
    }
  }

  toggle_status_ad(name, val) {
    if (val.status == 'ENABLE') {
      this.Current_option_ad = 0;
    } else if (val.status == 'DISABLE') {
      this.Current_option_ad = 1;
    }

    var ad_config = {
      configuration: {
        domain_name: val.domain_name,
        pwd: val.pwd,
        host_name: val.ip_address,
        dn_admin_account: val.admin_account
      },
      status: this.Current_option_ad,
      licence_key: this.Current_license,
      config: 7,
      token: localStorage.getItem('token')
    };
    this.socketdataService.saveSettings(ad_config);
    this.response_toast('ad_save');
  }

  toggle_status_aws(name, val) {
    if (name == 'toggle') {
      if (val.status == 'ENABLE') {
        this.Current_option_aws = 0;
      } else if (val.status == 'DISABLE') {
        this.Current_option_aws = 1;
      }

      var aws_config = {
        asset_id: val.asset_id,
        config: 17,
        status: this.Current_option_aws,
        assetConfig: {
          aws_key_id: val.aws_access_key_id,
          secret_key: val.aws_secret_key,
          aws_region: val.aws_region
        },
        customer_id: this.Current_customer_id
      };
      this.socketdataService.saveSettings(aws_config);
      this.response_toast('aws_edit');
    } else if (name == 'delete') {
      if (val.status == 'ENABLE') {
        this.Current_option_aws = 0;
      } else if (val.status == 'DISABLE') {
        this.Current_option_aws = 1;
      }

      var aws_config1 = {
        asset_id: val.asset_id,
        config: 17,
        status: this.Current_option_aws,
        customer_id: this.Current_customer_id,
        isDeleted: true
      };
      this.socketdataService.saveSettings(aws_config1);
      this.response_toast('aws_delete');
    }
  }

  valid_key() {
    for (var i in this.asset) {
      if (this.asset[i].aws_access_key_id == this.model.accesskey) {
        if (this.asset[i]['asset_id'] == this.asset_edited_value['asset_id']) {
          this.assetStatus = false;
        } else {
          this.asseterrormsg = 'This aws access key already available';
          this.assetStatus = true;
          break;
        }
      } else {
        this.assetStatus = false;
        this.asseterrormsg = '';
      }
    }
  }

  assetStatus: boolean = true;

  awsenable_create() {
    if (this.asset.length != 0) {
      for (var i in this.asset) {
        if (this.asset[i].aws_access_key_id == this.model.accesskey) {
          this.asseterrormsg = 'This aws access key already available';
          this.assetStatus = true;
          break;
        } else {
          this.assetStatus = false;
          this.asseterrormsg = '';
        }
      }
    } else {
      this.assetStatus = false;
    }
    if (this.assetStatus == false) {
      var aws_config = {
        asset_id: null,
        config: 16,
        status: this.Current_option_aws,
        assetConfig: {
          aws_key_id: this.model.accesskey,
          secret_key: this.model.secretaccesskey,
          aws_region: this.model.region
        },
        customer_id: this.Current_customer_id
      };
      this.socketdataService.saveSettings(aws_config);
      this.response_toast('aws_save');
    }
  }

  awsenable_edit() {
    for (var i in this.asset) {
      if (this.asset[i].aws_access_key_id == this.model.accesskey) {
        if (this.asset[i]['asset_id'] == this.asset_edited_value['asset_id']) {
          this.assetStatus = false;
        } else {
          this.asseterrormsg = 'This aws access key already available';
          this.assetStatus = true;
          break;
        }
      } else {
        this.assetStatus = false;
        this.asseterrormsg = '';
      }
    }

    if (this.assetStatus == false) {
      var aws_config = {
        asset_id: this.asset_edited_value['asset_id'],
        config: 17,
        status: this.Current_option_aws,
        assetConfig: {
          aws_key_id: this.model.accesskey,
          secret_key: this.model.secretaccesskey,
          aws_region: this.model.region
        },
        customer_id: this.Current_customer_id
      };
      this.socketdataService.saveSettings(aws_config);
      this.response_toast('aws_edit');
    }
  }

  AWSenable_details() {
    this.awssubmit = true;
    if (this.enableFormAWS.invalid) {
      return;
    }

    if (this.asset_config_status == 'create') {
      this.awsenable_create();
    } else if (this.asset_config_status == 'edit') {
      this.awsenable_edit();
    }
  }

  // User management -CRUD -------------------------------------

  public createNewUser(user) {
    this.user_mgt_status = user;

    this.selectedRole = this.userRoleList[0];
    this.userEmailValid = false;
    this.user_management_popup = true;
  }

  public editUser(user: any, task: any) {
    this.user_mgt_status = task;
    this.model.username = user.email;
    this.model.role = user.role;
    this.user_management_popup = true;
  }

  public removeUser(user) {

    const current_user = {
      config: 19,
      token: localStorage.getItem('token'),
      customer_id: this.Current_customer_id,
      isAdminUser: user.isAdminUser,
      licence_key: this.Current_license,
      username: user.username
    };

    this.socketdataService.saveSettings(current_user);
    this.response_toast('user_remove');
  }

  public userMgtClose() {
    this.user_management_popup = false;
    this.clear();
  }

  public userUpdateAndSave() {

    if (this.model.email && this.userEmailValid) {
      if (this.model.user_name && this.usernameValid) {
        const newuserdetails = {
          config: 18,
          role: !this.selectedRole ? this.userRoleList[1].role : this.selectedRole.role,
          customer_id: this.Current_customer_id,
          customer_name: localStorage.getItem('customer_name'),
          username: this.model.user_name,
          useremail: this.model.email.toLowerCase(),
          token: localStorage.getItem('token'),
          licence_key: this.Current_license
        };

        this.socketdataService.saveSettings(newuserdetails);
        this.response_toast('user_save');
        this.user_management_popup = false;
        this.clear();
      } else {
        this.usernamemsg = ' Please enter a valid username';
      }
    } else {
      this.usernameerrormsg = ' Please enter a valid email address';
    }
  }

  public change_userRole(e) {
    // console.log(this.selectedRole);
    // console.log(e.value.role);
  }

  public isValidusername(e) {
    const expression_name = /^[a-zA-Z ]*$/;

    if (expression_name.test(String(this.model.user_name))) {
      this.usernamemsg = '';
      this.usernameValid = true;
    } else {
      this.usernamemsg = 'Please enter a valid username';
      this.usernameValid = false;
    }

  }

  public keyup(event) {

    const getemail = this.model.email.toLowerCase();

    const local = getemail.substring(0, getemail.lastIndexOf('@'));
    const domainpart = getemail.substring(getemail.lastIndexOf('@') + 1);
    const dot = domainpart.substring(0, domainpart.lastIndexOf('.'));

    // tslint:disable-next-line: max-line-length
    const expression = /(?!.*\.{2})^([a-z\d!#$%&'*+\-\/=?^_`{|}~\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF]+(\.[a-z\d!#$%&'*+\-\/=?^_`{|}~\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF]+)*|"((([ \t]*\r\n)?[ \t]+)?([\x01-\x08\x0b\x0c\x0e-\x1f\x7f\x21\x23-\x5b\x5d-\x7e\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF]|\\[\x01-\x09\x0b\x0c\x0d-\x7f\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF]))*(([ \t]*\r\n)?[ \t]+)?")@(([a-z\d\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF]|[a-z\d\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF][a-z\d\-._~\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF]*[a-z\d\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])\.)+([a-z\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF]|[a-z\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF][a-z\d\-._~\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF]*[a-z\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])\.?$/i;




    this.usernameerrormsg = getemail;
    if (expression.test(String(getemail).toLowerCase())) {
      this.usernameerrormsg = '';
      this.userEmailValid = true;
    } else {
      this.usernameerrormsg = ' Please enter a valid email address';
      this.userEmailValid = false;
    }

    if (local.length > 64) {
      this.usernameerrormsg = 'Local part of the email may not be greater than 64 characters ';
    } else if (dot.length > 255) {
      this.usernameerrormsg = 'Domain part of the email may not be greater than 255 characters';
    } else if (local.length > 64 && dot.length > 255) {
      this.usernameerrormsg =
        'Local part of the email may not be greater than 64 characters and Domain part of the email may not be greater than 255 characters';
    } else if (expression.test(String(getemail).toLowerCase())) {
      this.userEmailValid = true;
    } else {
      this.userEmailValid = false;
    }
  }

  // User management -CRUD -------------------------------------

  subnet_create(name) {
    this.subnet_status = name;
    this.ipaddress_popup = true;
  }

  subnet_close() {
    this.ipaddress_popup = false;
    this.clear();
  }

  email_create() {
    this.email_popup = true;
  }

  email_close() {
    this.email_popup = false;
    this.clear();
  }

  ad_config_status: any;
  ad_create(name) {
    if (name == 'create') {
      this.clear();
    }

    this.ad_popup = true;
    this.ad_config();
  }
  ad_close() {
    this.ad_popup = false;
    this.clear();
  }

  aws_create(status, value) {
    this.asset_config_status = status;
    this.asset_edited_value = value;
    this.clear();
    this.aws_popup = true;
    this.aws_config();
  }
  aws_close() {
    this.aws_popup = false;
    this.clear();
  }

  wlc_create() {
    this.wlc_popup = true;
    this.isWlcEditEnabled = false;
    this.errorMsgAccessKeyDuplicate = '';
    this.errorMsgIPAddressDuplicate = '';
    this.isAccesskeyErDuplicated = false;
    this.isIPAddressErDuplicated = false;
    this.selectedVender = this.venderlist[0];
    this.wlcFormSelector(this.venderlist[0].name);


  }

  wlc_close() {
    this.isJuniperSelected = false;
    this.isCiscoSelected = false;
    this.isSolarSelected = false;
    this.wlc_popup = false;
    this.clear();
  }

  /**
   * vendor Two Create
   */
  public vendorTwoCreate(event) {
    event.preventDefault();

    this.vendorTwoSubmitted = true;

    if (!this.FnAccessKeyCheck(this.model.wlcaccessid)) {
      return;
    }

    if (this.vendorTwo.invalid) {
      return;
    }
    if (
      this.selectedVender.name === undefined ||
      this.selectedVender.name === '' ||
      this.selectedVender.name === null
    ) {
      this.model.vendor = this.venderlist[0].name;
    }

    const details = {
      config: 12,
      action: this.isWlcEditEnabled ? 1 : 0, // new record creation
      wlc_id: this.model.wlc_id,

      vendor: this.isWlcEditEnabled ? this.model.vendor : this.selectedVender.name,
      accesskey: this.model.wlcaccessid,
      path: this.model.wlcpath,
      customer_id: this.Current_customer_id,
      licence_key: this.Current_license
    };
    this.socketdataService.saveSettings(details);
    this.response_toast('wlc_save');
  }

  public vendorThreeCreate(event) {
    event.preventDefault();

    this.vendorThreeSubmitted = true;

    if (this.vendorThree.invalid) {
      return;
    };

    if (
      this.selectedVender.name === undefined ||
      this.selectedVender.name === '' ||
      this.selectedVender.name === null
    ) {
      this.model.vendor = this.venderlist[0].name;
    }

    const details = {
      config: 12,
      action: this.isWlcEditEnabled ? 1 : 0, // new record creation
      wlc_id: this.model.wlc_id,

      vendor: this.isWlcEditEnabled ? this.model.vendor : this.selectedVender.name,
      url: this.model.wlcurl,
      username: this.model.wlcusername,
      password: this.model.wlcpassword,
      customer_id: this.Current_customer_id,
      licence_key: this.Current_license
    };
    this.socketdataService.saveSettings(details);
    this.response_toast('wlc_save');
  }

  public WLC_enable_details(event) {

    event.preventDefault();

    this.vendorOneSubmitted = true;


    if (!this.FnIPAddressCheck(this.model.wlcipaddress)) {
      return;
    }

    if (this.vendorOne.invalid) {
      return;
    }

    if (this.isWlcEditEnabled) {
      this.CurrentVendor = this.model.vendor;
    } else {
      this.CurrentVendor = this.selectedVender.name;
    }

    let details = {
      config: 12,
      action: this.isWlcEditEnabled ? 1 : 0, // new record creation
      wlc_id: this.model.wlc_id,
      vendor: this.CurrentVendor,
      ipaddress: this.model.wlcipaddress,
      username: this.model.wlcusername,
      password: this.model.wlcpassword,
      customer_id: this.Current_customer_id,
      licence_key: this.Current_license
    };

    this.socketdataService.saveSettings(details);

    this.isJuniperSelected = false;
    this.isCiscoSelected = false;
    this.isSolarSelected = false;

    this.response_toast('wlc_save');
  }

  old_accesskey: any;
  old_ipaddress: any;
  public wlc_edit(data: {
    vendor: string;
    wlc_id: any;
    ipaddress: any;
    username: any;
    password: any;
    accesskey: any;
    path: any;
    url: any
  }) {
    this.isWlcEditEnabled = true; ///  edit mode on for wlc
    this.selectedVender = this.venderlist.find(x => x.name == data.vendor);
    this.model = {};
    this.wlc_popup = true;
    this.wlcFormSelector(data.vendor); // form switcher
    //  setTimeout(function() {}, 2000);
    this.model.wlc_id = data.wlc_id;
    this.model.vendor = data.vendor;
    this.model.wlcipaddress = data.ipaddress;
    this.old_ipaddress = data.ipaddress;
    this.model.wlcusername = data.username;
    this.model.wlcpassword = data.password;
    this.model.wlcaccessid = data.accesskey;
    this.old_accesskey = data.accesskey;
    this.model.wlcpath = data.path;
    this.model.wlcurl = data.url;
    this.errorMsgIPAddressDuplicate = '';
    this.errorMsgAccessKeyDuplicate = "";
  }

  public wlc_remove(data) {
    const details = {
      config: 12,
      wlc_id: data.wlc_id,
      action: 2,
      vendor: data.vendor,
      customer_id: this.Current_customer_id,
      licence_key: this.Current_license
    };

    this.socketdataService.saveSettings(details);
    this.response_toast('wlc_delete');

    // + data.vender==undefined ?'' : data.vender +
    // this.confirmationService.confirm({
    //   message: 'Do you want to delete the vendor  ?',
    //   header: 'Delete Confirmation',
    //   icon: 'pi pi-info-circle',
    //   accept: () => {
    //     this.socketdataService.saveSettings(details);
    //     this.response_toast('wlc_delete');
    //     // this.toastr.info('Deleted successfully');
    //   },
    //   reject: () => {}
    // });
  }

  toggleShow(val) {
    this.show = !this.show;
    if (val == 1) {
      if (this.show) {
        this.type1 = 'text';
      } else {
        this.type1 = 'password';
      }
    } else if (val == 2) {
      if (this.show) {
        this.type2 = 'text';
      } else {
        this.type2 = 'password';
      }
    } else if (val == 0) {
      if (this.show) {
        this.type = 'text';
      } else {
        this.type = 'password';
      }
    } else if (val == 3) {
      if (this.show) {
        this.type3 = 'text';
      } else {
        this.type3 = 'password';
      }
    }
  }

  ngOnDestroy() {
    if (this.connection) {
      this.connection.unsubscribe();
    }
    this.headerEvent.unsubscribe();
    this.intercomm.setpageBg(true); // [ngClass]="pageBgStatus ? 'black-bg' : 'gray-bg'">
    if (this.id) {
      clearInterval(this.id);
    }
    this.isalive = false;
  }

  generate_licence() {
    var generate_details = {
      config: 15,
      token: localStorage.getItem('token'),
      customer_id: this.Current_customer_id
    };
    this.isGlDisabled = true;
    this.socketdataService.saveSettings(generate_details);
    this.response_toast('licence_update_generate');
  }

  after_generate_licence() {
    for (var i = 0; i < 5; i++) {
      setTimeout(() => {
        this.management_load();
      }, i * 2000);
    }
  }

  openNav() {
    document.getElementById('ai3-sidenav').style.width = 'auto';
  }

  closeNav() {
    document.getElementById('ai3-sidenav').style.width = '0';
  }
}
