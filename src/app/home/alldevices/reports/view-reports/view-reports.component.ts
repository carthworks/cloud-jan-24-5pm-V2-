import { Component, OnInit, ViewChild, HostListener } from '@angular/core';
import { SocketdataService } from 'src/app/services/socketdata.service';
import { ToastrService } from 'ngx-toastr';
import { HttpClient } from '@angular/common/http';
import { ActivatedRoute } from '@angular/router';
import { SelectItem } from 'primeng/api';
import * as moment from 'moment';
import { Subscription } from 'rxjs';
import { DomSanitizer } from '@angular/platform-browser';

export class Compare {
  compare: any;
}

@Component({
  selector: 'app-view-reports',
  templateUrl: './view-reports.component.html',
  styleUrls: ['./view-reports.component.css']
})
export class ViewReportsComponent implements OnInit {

  @HostListener('document:updateIframe', ['$event'])
  onUpdateIframe(param) {
    let iframe = document.getElementById('myframe') as HTMLIFrameElement;
    iframe.style.height = iframe.contentWindow.document.body.scrollHeight + 20 + 'px';

    setTimeout(() => {
      iframe.style.height = iframe.contentWindow.document.body.scrollHeight + 20 + 'px';
    }, 100);

  }

  reportsViewLoading: boolean = false;

  recipientEmails: any[] = [];
  customerId: number = null;
  currentOperation: string = "";
  currentEmailHolder: string = "";

  reportsModConnection: Subscription = null;
  getEmailsConnection: Subscription = null;
  getSettingsConnection: Subscription = null;
  myTemplate: any;

  stdRptType: string = "";
  reportingPeriod: string = "";
  reportId: any;

  currentReport: any = {};

  frequencyOptions: SelectItem[];
  selectedFrequency: any = 'daily';

  repeatCounts: SelectItem[];
  selectedRepeatCount: any = 1;

  repeatOptions: SelectItem[];
  selectedRepeatOption: any = 'daily';

  repeatTime: Date = new Date();
  daysToSend: any[] = [];

  recurringDataValid: boolean = false;

  repeatDays: any[] = [
    { label: 'SU', value: 0, active: false },
    { label: 'M', value: 1, active: false },
    { label: 'TU', value: 2, active: false },
    { label: 'W', value: 3, active: false },
    { label: 'TH', value: 4, active: false },
    { label: 'F', value: 5, active: false },
    { label: 'SA', value: 6, active: false }];

  iframesrc: any;
  forCompare: any;

  reqToSend: any = {};
  isViewOnly: boolean;
  isViewOnlySave: boolean;
  constructor(private socketDataService: SocketdataService,
    private toastr: ToastrService,
    private http: HttpClient,
    private route: ActivatedRoute,
    private sanitizer: DomSanitizer) {
    this.route.paramMap.subscribe((params: any) => {
      this.iframesrc = this.sanitizer.bypassSecurityTrustResourceUrl(`${window.location.origin}/ms/reportpreview/v1/${params.params.id}`);
      // this.myTemplate = `<iframe id="myframe" (load)="onLoad()" frameborder=0 width="100%" height="1px" src="${window.location.origin}/ms/reportpreview/v1/${params.params.id}"></iframe>`;

      this.currentReport = JSON.parse(localStorage.getItem('currentReport'));
      this.reportId = params.params.id;
      this.isViewOnly = params.params.viewOnly == 'true';
      this.isViewOnlySave = this.isViewOnly;

      this.stdRptType = this.currentReport['mapped_type'];
      this.reportingPeriod = this.currentReport['period'];

      if (this.currentReport.report_nature == 2) {
        this.setRecursiveControls();
      }
    });

    let setOfCustomers = JSON.parse(atob(localStorage.getItem('customer_details')));
    if (localStorage.getItem('setting_customer_id') == '0') {
      if (localStorage.getItem('customer_id') == '0') {
        this.customerId == parseInt(setOfCustomers[0].id);
      } else {
        this.customerId = parseInt(localStorage.getItem('customer_id'));
      }
    } else {
      this.customerId = parseInt(localStorage.getItem('setting_customer_id'));
    }

    this.getEmails();

    this.getEmailsConnection = this.socketDataService.getSettings().subscribe((emailResponse: any) => {
      this.recipientEmails = [];
      emailResponse.emailList.map(email => {
        this.recipientEmails.push(email);
      })
    });

    this.getSettingsConnection = this.socketDataService.getsaveSettings().subscribe(saveResponse => {
      if (saveResponse) {
        if (this.currentOperation == 'email_add') {
          this.toastr.info('Email added successfully');
        } else if (this.currentOperation == 'email_remove') {
          this.toastr.info('Email removed successfully');
        }

        this.getEmails();
      } else {
        if (this.currentOperation == 'email_add') {
          this.toastr.error('Failed to add email');
        } else if (this.currentOperation == 'email_remove') {
          this.toastr.error('Failed to remove email');
        }
      }

      this.currentOperation = "";
    });
  }

  onLoad() {
    let iframe = document.getElementById('myframe') as HTMLIFrameElement;
  }

  ngOnInit() {
    document.getElementById('dashboard-height-fix').style.height = '100%';

    this.frequencyOptions = [
      { label: 'Daily', value: 'daily' },
      { label: 'Weekly', value: 'weekly' },
      { label: 'Monthly', value: 'monthly' },
      { label: 'Custom', value: 'custom' }
    ];

    this.onRepeatOptChange(false);
  }

  setRecursiveControls() {
    this.forCompare = new Compare();

    this.forCompare.selectedFrequency = this.currentReport['frequency'].value;
    this.selectedFrequency = this.currentReport['frequency'].value;

    this.prepareRepeatOptions(false);

    this.repeatTime = new Date(new Date().setHours(this.currentReport['frequency']['repeaton']['time'].hours, this.currentReport['frequency']['repeaton']['time'].minutes, 0))

    this.forCompare.hours = this.currentReport['frequency']['repeaton']['time'].hours;
    this.forCompare.minutes = this.currentReport['frequency']['repeaton']['time'].minutes;


    if (this.currentReport['frequency'].hasOwnProperty('repeatevery')) {
      this.selectedRepeatCount = this.currentReport['frequency']['repeatevery'].interval;
      this.selectedRepeatOption = this.currentReport['frequency']['repeatevery'].type;

      this.forCompare.selectedRepeatCount = this.currentReport['frequency']['repeatevery'].interval;
      this.forCompare.selectedRepeatOption = this.currentReport['frequency']['repeatevery'].type;
    }

    if (this.currentReport['frequency'].hasOwnProperty('repeaton')) {
      this.daysToSend = this.currentReport['frequency']['repeaton']['day'];
      this.currentReport['frequency']['repeaton'].day.map(day => {
        this.repeatDays[day].active = true
      })

      this.forCompare.daysToSend = this.currentReport['frequency']['repeaton']['day'];
    }
  }

  sendReport() {
    if (this.recipientEmails.length == 0) {
      this.toastr.info("Please add recipient emails to proceed");
    } else {
      this.toastr.info("Please wait. Email trigger is initiated.");
      this.http.get(window.location.origin + '/ms/triggeremail/v1/' + this.reportId).subscribe(res => {
        this.toastr.info('Email sent successfully');
      }, error => {
        this.toastr.error('Failed to send email');
      });
    }
  }

  saveReport() {
    this.isViewOnlySave = false;
    
    let req: any = {
      report_id: this.currentReport.report_id,
      param: this.isViewOnly ? 4 : 1
    }
    
    if (this.currentReport.report_nature == 2) {
      req['frequency'] = this.reqToSend;      
    }

    this.socketDataService.removeReport(req);

    this.reportsModConnection = this.socketDataService.onRemoveReport().subscribe(reportModResponse => {
      this.reportsModConnection.unsubscribe();
      if (reportModResponse) {
        this.toastr.info('Report saved successfully');
        if (this.currentReport.report_nature == 2) {
          this.forCompare.selectedFrequency = req['frequency'].value;
          this.forCompare.hours = req['frequency']['repeaton']['time'].hours;
          this.forCompare.minutes = req['frequency']['repeaton']['time'].minutes;
          this.forCompare.selectedRepeatCount = req['frequency']['repeatevery'].interval;
          this.forCompare.selectedRepeatOption = req['frequency']['repeatevery'].type;
          this.forCompare.daysToSend = req['frequency']['repeaton']['day'];
          this.checkRecuringValues();
        }
      } else {
        this.toastr.error('Failed to save report');
      }
    })
  }

  addEmail(param) {
    this.currentOperation = 'email_add';
    if (this.currentEmailHolder.length != 0 && param) {
      if (this.recipientEmails.includes(this.currentEmailHolder.toLocaleLowerCase())) {
        this.toastr.error("Email id already exists");
      } else {
        let req = {
          config: 5,
          token: localStorage.getItem('token'),
          customer_id: this.customerId,
          emailAddress: this.currentEmailHolder.toLocaleLowerCase()
        }

        this.socketDataService.saveSettings(req);

        this.currentEmailHolder = '';
      }
    }
  }

  removeEmail(email) {
    this.currentOperation = 'email_remove';

    let req = {
      config: 6,
      token: localStorage.getItem('token'),
      customer_id: this.customerId,
      emailAddress: email
    }

    this.socketDataService.saveSettings(req);
  }

  getEmails() {
    var req = {
      config: 3,
      token: localStorage.getItem('token'),
      customer_id: this.customerId
    };
    this.socketDataService.requestSettings(req);
  }

  onFreqChange() {
    this.prepareRepeatOptions(true);
    this.checkRecuringValues();
  }

  prepareRepeatOptions(param) {
    if (this.selectedFrequency == 'custom') {
      this.repeatOptions = [
        { label: 'Days', value: 'daily' },
        // { label: 'Weeks', value: 'weekly' }
      ];
      this.selectedRepeatOption = 'daily';
      this.onRepeatOptChange(param);
    } else if (this.selectedFrequency == 'monthly') {
      this.repeatOptions = [
        { label: '1st', value: '1' },
        { label: '15th', value: '15' },
        { label: '1st & 15th', value: '1&15' }
      ];
      this.selectedRepeatOption = '1';
    }else if(this.selectedFrequency == 'weekly' && param){
      this.onRepeatDayChange(null, 0);
    }
  }

  checkRecuringValues() {
    let recurringReq: any = {
      repeaton: {
        time: {
          hours: 0,
          minutes: 0
        },
        day: []
      },
      value: "",
      repeatevery: {
        interval: 0,
        type: ""
      }
    };

    recurringReq.value = this.selectedFrequency;
    recurringReq.repeaton.time.hours = moment(this.repeatTime).hours();
    recurringReq.repeaton.time.minutes = moment(this.repeatTime).minutes();

    if (this.selectedFrequency == 'custom') {
      let repeatevery: any = {
        interval: 0,
        type: ''
      }

      repeatevery.interval = this.selectedRepeatCount;
      repeatevery.type = this.selectedRepeatOption;

      if (this.selectedRepeatOption == 'daily') {
        recurringReq.repeaton['day'] = this.daysToSend;
      }

      recurringReq['repeatevery'] = repeatevery;
    } else if (this.selectedFrequency == 'monthly') {
      let repeatevery: any = {
        interval: 0,
        type: ''
      }
      repeatevery.type = this.selectedRepeatOption;
      recurringReq['repeatevery'] = repeatevery;
    } else if (this.selectedFrequency == 'weekly') {
      recurringReq.repeaton['day'] = this.daysToSend;

      if (this.daysToSend.length == 0) {
        this.recurringDataValid = true;
        return;
      }
    }

    this.reqToSend = recurringReq;


    if (recurringReq['value'] == this.forCompare.selectedFrequency &&
      recurringReq['repeaton']['time']['hours'] == this.forCompare.hours &&
      recurringReq['repeaton']['time']['minutes'] == this.forCompare.minutes &&
      JSON.stringify(recurringReq['repeaton']['day']) == JSON.stringify(this.forCompare.daysToSend) &&
      recurringReq['repeatevery']['interval'] == this.forCompare.selectedRepeatCount &&
      recurringReq['repeatevery']['type'] == this.forCompare.selectedRepeatOption) {
      this.recurringDataValid = true;
    } else {
      this.recurringDataValid = false;
    }
  }

  onRepeatTimeChange() {
    this.checkRecuringValues();
  }

  onRepeatDayChange(event, index) {
    this.repeatDays[index].active = !this.repeatDays[index].active;
    this.daysToSend = [];

    this.repeatDays.map(dayObj => {
      if (dayObj.active) {
        this.daysToSend.push(dayObj.value);
      }
    });

    this.checkRecuringValues();
  }

  onRepeatCountChange() {
    this.checkRecuringValues();
  }

  onRepeatOptChange(isOnEdit) {

    if (this.selectedRepeatOption == 'daily') {
      this.repeatCounts = [];
      for (let index = 0; index <= 30; index++) {
        this.repeatCounts.push({ label: `${index + 1}`, value: index + 1 })
      }

      if (isOnEdit) {
        this.selectedRepeatCount = 1;
      }
    } else if (this.selectedRepeatOption == 'weekly') {
      this.repeatCounts = [
        { label: '0', value: 0 },
        { label: '1', value: 1 },
        { label: '2', value: 2 },
        { label: '3', value: 3 },
        { label: '4', value: 4 }
      ];

      if (isOnEdit) {
        this.selectedRepeatCount = 0;
      }
    }


    if (this.currentReport.report_nature == 2) {
      this.checkRecuringValues();
    }
  }

  ngOnDestroy() {
    document.getElementById('dashboard-height-fix').style.height = '70%';

    this.getEmailsConnection.unsubscribe();
    this.getSettingsConnection.unsubscribe();
    
  }

}
