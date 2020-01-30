import { Component, OnInit } from '@angular/core';
import { SelectItem, SelectItemGroup } from 'primeng/api';
import * as moment from 'moment';
import 'moment-timezone';
import { Subscription } from 'rxjs';
import { Datasource } from 'ngx-ui-scroll';
import { AppComponent } from 'src/app/app.component';
import { ConnectionHandler } from 'src/app/services/connectionHandler.service';
import { SocketdataService } from 'src/app/services/socketdata.service';
import { IntercommunicationService } from 'src/app/services/intercommunication.service';
import { ToastrService } from 'ngx-toastr';
import { Router } from '@angular/router';

import * as FileSaver from 'file-saver';
import { HttpClient } from '@angular/common/http';
@Component({
  selector: 'app-reports',
  templateUrl: './reports.component.html',
  styleUrls: ['./reports.component.css']
})
export class ReportsComponent implements OnInit {

  reportTypes: SelectItem[] = [
    { label: 'One-time', value: 1 },
    { label: 'Recurring', value: 2 }
  ];
  currentReportType: number = 1;

  // standardReportTypes: SelectItem[];
  standardReportTypes: SelectItemGroup[];
  selectedStdRptType: any = 1;

  reportPeriods: any[] = [
    { label: 'Day', value: '1 Day', active: false, momentValue: 1, momentString: 'days' },
    { label: '7 Days', value: '7 Days', active: false, momentValue: 7, momentString: 'days' },
    { label: '30 Days', value: '30 Days', active: false, momentValue: 30, momentString: 'days' },
    { label: '90 Days', value: '90 Days', active: false, momentValue: 90, momentString: 'days' },
    { label: '180 Days', value: '180 Days', active: false, momentValue: 180, momentString: 'days' }];
  customReportPeriod: any = { label: 'Custom', value: 5, active: false };
  customRangeDates: Date[];
  currentReportingPeriod: string = '';
  staticVsDynamicRptPrd: string = '';
  maxDateValue: Date = new Date();
  staticVsDynamicDate: Date;

  frequencyOptions: SelectItem[];
  selectedFrequency: any = 'daily';

  repeatCounts: SelectItem[];
  selectedRepeatCount: any = 1;

  repeatOptions: SelectItem[];
  selectedRepeatOption: any = 'daily';

  repeatDays: any[] = [
    { label: 'SU', value: 0, active: true },
    { label: 'M', value: 1, active: false },
    { label: 'TU', value: 2, active: false },
    { label: 'W', value: 3, active: false },
    { label: 'TH', value: 4, active: false },
    { label: 'F', value: 5, active: false },
    { label: 'SA', value: 6, active: false }];

  daysToSend: any[] = [0];

  repeatTime: Date = new Date();

  recipientEmails: any[] = [];
  currentEmailHolder: string = "";

  isScrollable: boolean;
  isTablet: boolean;
  reportsSource: any;
  reportsConnection: Subscription = null;
  reportsGenConnection: Subscription = null;
  reportsRemConnection: Subscription = null;
  getEmailsConnection: Subscription = null;
  getSettingsConnection: Subscription = null;
  reportsLoading: boolean = false;
  reportsDataNotAvail: boolean = false;

  customerId: number = null;
  customerChangeEvent: Subscription = null;
  currentOperation: string = "";

  startAndEndTstamps: any = {
    start: 0,
    end: 0,
    period: "",
    valid: false
  }

  sortBy: any = {
    fieldname: 'updatedAt',
    order: -1
  };
  currentSortedField: string = 'updatedAt';

  recurringDataValid: boolean = false;

  timezone: string = moment.tz.guess();

  disableDownload: boolean = false;
  constructor(
    public app: AppComponent,
    private connectionHandler: ConnectionHandler,
    private socketDataService: SocketdataService,
    public interCommunication: IntercommunicationService,
    private toastr: ToastrService,
    public router: Router,
    private http: HttpClient
  ) {
    localStorage.setItem('last_loaded_screen', '/alldevices/reports');

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

    this.prepareCustomerId();

    this.customerChangeEvent = this.interCommunication.getheaderdropdownClicked().subscribe(isChanged => {
      if (isChanged) {
        this.prepareCustomerId();

        if (this.reportsSource.adapter.isInitialized) {
          this.reportsSource.adapter.reload(0);
        }
      }
    })
  }

  ngOnInit() {
    document.getElementById('dashboard-height-fix').style.height = '100%';
    this.isTablet = !this.app.isSettingsDownloadEnable;

    // this.standardReportTypes = [
    //   { label: 'New Devices', value: 1 },
    //   { label: 'Static vs Dynamic Threats', value: 2 },
    //   { label: 'Assets and Security Incidents', value: 3 },
    //   { label: 'New Incidents Detected', value: 4 }
    // ];

    // this.standardReportTypes = [
    //   { label: 'Assets and Security Incidents', value: 1 },
    //   { label: 'New Devices', value: 2 },
    //   { label: 'New Incidents Detected', value: 3 },
    //   { label: 'Static vs Dynamic Threats', value: 4 }
    // ];

    this.standardReportTypes = [
      {
        items: [
          { label: 'Assets and Security Incidents', value: 1 },
          { label: 'New Devices', value: 2 },
          { label: 'New Incidents Detected', value: 3 },
          { label: 'Static vs Dynamic Threats', value: 4 }
        ],
        label: ''
      }
    ];

    this.frequencyOptions = [
      { label: 'Daily', value: 'daily' },
      { label: 'Weekly', value: 'weekly' },
      { label: 'Monthly', value: 'monthly' },
      { label: 'Custom', value: 'custom' }
    ];

    this.prepareRepeatOptions();

    this.reportsSource = new Datasource({
      get: (index, count, success) => {
        let param: any = {};
        param['start'] = index;
        param['length'] = count;
        param['report_nature'] = this.currentReportType;
        param['sortby'] = this.sortBy;

        this.reportsLoading = true;
        this.connectionHandler.subscribeConnection(
          'getReportInfo',
          param
        );

        this.reportsConnection = this.socketDataService.onReportInfo().subscribe(info => {

          this.connectionHandler.unsubscribeConnection();
          this.reportsConnection.unsubscribe();

          if (info['reportInfo'] === undefined || info['reportInfo'].length == 0) {
            if (this.reportsSource.adapter.itemsCount === 0) {
              this.reportsDataNotAvail = true;
            } else {
              success([]);
            }
            this.reportsLoading = false;
          } else {
            const reportInfo = info['reportInfo'];

            success(this.updateDataTableReports(reportInfo));

            // setTimeout(() => {
            //   this.isScrollable = this.scrollbarVisible('reports-tab-scroll');
            // }, 100)

            this.reportsDataNotAvail = false;
            this.reportsLoading = false;
          }
        });
      },
      settings: {
        bufferSize: 10,
        minIndex: 0,
        startIndex: 0
      }
    });

  }

  ngAfterViewInit(){
    this.onReportPeriodChange(null, 0);
  }

  prepareRepeatOptions() {
    if (this.selectedFrequency == 'custom') {
      this.repeatOptions = [
        { label: 'Days', value: 'daily' },
        // { label: 'Weeks', value: 'weekly' }
      ];
      this.selectedRepeatOption = 'daily';
      this.onRepeatOptChange();
    } else {
      this.repeatOptions = [
        { label: '1st', value: '1' },
        { label: '15th', value: '15' },
        { label: '1st & 15th', value: '1&15' }
      ];
      this.selectedRepeatOption = '1';
    }
  }

  getEmails() {
    var req = {
      config: 3,
      token: localStorage.getItem('token'),
      customer_id: this.customerId
    };
    this.socketDataService.requestSettings(req);
  }

  prepareCustomerId() {
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
  }

  onReportTypeChange(event) {
    this.reportsSource.adapter.reload(0);
    if (this.currentReportType == 2) {
      this.maxDateValue = null;
    } else {
      this.maxDateValue = new Date();
    }

    this.selectedStdRptType = 1;
    this.clearReportData();
    this.onReportPeriodChange(null, 0);
    this.checkDaysToSendIsAvailable();
  }

  onReportPeriodChange(event, index) {
    this.clearReportData();
    this.reportPeriods.map((period, i) => {
      if (i == index) {
        period.active = true;
        this.calculateReportingPeriod(period);
      } else {
        period.active = false;
      }
    });

    this.customReportPeriod.active = false;
  }

  onStdRptChange() {
    this.clearReportData();
    if (this.currentReportType == 2 && (this.selectedStdRptType == 3 || this.selectedStdRptType == 4)) {
      this.staticVsDynamicDate = new Date();
      this.staticVsDynamicDate.setDate(this.staticVsDynamicDate.getDate() - 1);
      this.onDateSelect();
    }

    if(this.selectedStdRptType == 1 || this.selectedStdRptType == 2){
      this.onReportPeriodChange(null, 0);
    }
  }

  calculateReportingPeriod(period) {
    // if (this.currentReportType == 1) {
    this.currentReportingPeriod = ` : ${moment().subtract(period.momentValue, period.momentString).startOf('day').format('MMM DD YYYY, hh:mm A')} to ${moment().subtract(1, 'days').endOf('day').format('MMM DD YYYY, hh:mm A')}`
    this.calculateTimestamps(moment().subtract(period.momentValue, period.momentString).valueOf(), moment().subtract(1, 'days').valueOf(), period.value);
    // } else if (this.currentReportType == 2) {
    //   this.currentReportingPeriod = ` : ${moment().subtract(period.momentValue, period.momentString).startOf('day').format('MMM DD YYYY, hh:mm A')} to ${moment().format('MMM DD YYYY, hh:mm A')}`
    //   this.calculateTimestamps(moment().subtract(period.momentValue, period.momentString).valueOf(), moment().valueOf(), period.value);
    // }
  }

  onRepeatDayChange(event, index) {
    this.repeatDays[index].active = !this.repeatDays[index].active;
    this.daysToSend = [];

    this.repeatDays.map(dayObj => {
      if (dayObj.active) {
        this.daysToSend.push(dayObj.value);
      }
    });

    this.checkDaysToSendIsAvailable();
  }

  public onYearChange(event) {
  }

  public onMonthChange(event) {
  }

  checkDaysToSendIsAvailable() {
    if (this.currentReportType == 2) {
      if (this.selectedFrequency == 'weekly') {
        if (this.daysToSend.length == 0) {
          this.recurringDataValid = false;
        } else {
          this.recurringDataValid = true;
        }
      } else {
        this.recurringDataValid = true;
      }
    }
  }

  clearReportData() {
    this.reportPeriods.map((period) => {
      period.active = false;
    });

    this.currentReportingPeriod = "";
    this.staticVsDynamicRptPrd = "";

    this.startAndEndTstamps.valid = false;
    this.customRangeDates = undefined;
    this.staticVsDynamicDate = null;
  }

  onCustomReportPeriod(event) {
    this.clearReportData();
    this.customReportPeriod.active = true;

    if (this.customRangeDates != undefined) {
      this.onRangeSelect();
    }
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

  onRangeSelect() {
    if (this.customRangeDates[1] != null) {
      this.currentReportingPeriod = ` : ${moment(this.customRangeDates[0]).startOf('day').format('MMM DD YYYY, hh:mm A')} to ${moment(this.customRangeDates[1]).endOf('day').format('MMM DD YYYY, hh:mm A')}`
      this.calculateTimestamps(this.customRangeDates[0], this.customRangeDates[1], 'Custom');
    }
  }

  onDateSelect() {
    // if (this.currentReportType == 1) {
    this.staticVsDynamicRptPrd = ` : ${moment(this.staticVsDynamicDate).subtract(this.selectedStdRptType == 4 ? 20 : 2, 'days').startOf('day').format('MMM DD YYYY, hh:mm A')} to ${moment(this.staticVsDynamicDate).endOf('day').format('MMM DD YYYY, hh:mm A')}`
    this.calculateTimestamps(moment(this.staticVsDynamicDate).subtract(this.selectedStdRptType == 4 ? 20 : 2, 'days').valueOf(), moment(this.staticVsDynamicDate).valueOf(), 'Custom');
    // } else if (this.currentReportType == 2) {
    //   this.staticVsDynamicRptPrd = ` : ${moment().subtract(this.selectedStdRptType == 4 ? 20 : 2, 'days').startOf('day').format('MMM DD YYYY, hh:mm A')} to ${moment().format('MMM DD YYYY, hh:mm A')}`
    //   this.calculateTimestamps(moment().subtract(this.selectedStdRptType == 4 ? 20 : 2, 'days').valueOf(), moment().valueOf(), 'Custom');
    // }
  }

  calculateTimestamps(start, end, period) {
    this.startAndEndTstamps.start = moment(start).startOf('day').valueOf() / 1000;
    this.startAndEndTstamps.end = moment(end).endOf('day').valueOf() / 1000;
    this.startAndEndTstamps.period = period;
    this.startAndEndTstamps.valid = true;
  }

  saveReport(isViewOnly, sendEmail) {
    if (this.recipientEmails.length == 0 && sendEmail) {
      this.toastr.error("Please add recipient emails to proceed");
    } else {

      let req = {
        report_name: "",
        report_nature: this.currentReportType,
        report_type: this.selectedStdRptType,
        start_time: this.startAndEndTstamps.start,
        end_time: this.startAndEndTstamps.end,
        period: this.startAndEndTstamps.period,
        timezone: {
          zone: this.timezone
        }
      };

      if (this.currentReportType == 2) {
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
        }
        req['frequency'] = recurringReq;
      }

      if (isViewOnly) {
        req['isViewOnly'] = isViewOnly;
      } else {
        req['sendEmail'] = sendEmail;
      }

      if(this.startAndEndTstamps.valid){
        this.socketDataService.getReportGen(req);
        this.startAndEndTstamps.valid = false;
      }

      this.reportsGenConnection = this.socketDataService.onReportGen().subscribe(reportGenResponse => {
        this.reportsGenConnection.unsubscribe();
        if (reportGenResponse == true) {
          this.toastr.info('Report generated successfully');
          this.reportsSource.adapter.reload(0);
          this.clearReportData();
        } else if (reportGenResponse == false) {
          this.clearReportData();
          this.toastr.error('Failed to generate report');
        } else {
          let report: any = reportGenResponse;
          report['mapped_type'] = this.standardReportTypes[0]['items'][report.report_type - 1].label;

          localStorage.setItem("currentReport", JSON.stringify(report));

          this.router.navigate(['/alldevices/view-report', { id: report.report_id, viewOnly: true }]);
        }
      });
    }
  }

  onKeydown(e, bool) {
  }

  onFreqChange() {
    this.checkDaysToSendIsAvailable();
    this.prepareRepeatOptions();
  }

  onRepeatOptChange() {
    if (this.selectedRepeatOption == 'daily') {
      this.repeatCounts = [];
      for (let index = 0; index <= 30; index++) {
        this.repeatCounts.push({ label: `${index + 1}`, value: index + 1 })
      }
      this.selectedRepeatCount = 1;
    } else if (this.selectedRepeatOption == 'weekly') {
      this.repeatCounts = [
        { label: '0', value: 0 },
        { label: '1', value: 1 },
        { label: '2', value: 2 },
        { label: '3', value: 3 },
        { label: '4', value: 4 }
      ];
      this.selectedRepeatCount = 0;
    }

    this.checkDaysToSendIsAvailable();
  }

  sortReports(field) {
    if (field == this.currentSortedField) {
      this.sortBy.order = this.sortBy.order == -1 ? 1 : -1;
    } else {
      this.sortBy.fieldname = field;
      this.sortBy.order = -1;
      this.currentSortedField = field;
    }

    this.reportsSource.adapter.reload(0);
  }

  ngOnDestroy() {
    document.getElementById('dashboard-height-fix').style.height = '70%';
    this.customerChangeEvent.unsubscribe();
    this.getEmailsConnection.unsubscribe();

    this.getSettingsConnection.unsubscribe();

  }

  public updateDataTableReports(reportInfo) {
    let arrayToReturn: any[] = [];

    reportInfo.map(report => {
      report.modified = moment.unix(report.updatedAt).format('MMM DD YYYY, HH:mm:ss')
      report.mapped_type = this.standardReportTypes[0]['items'][report.report_type - 1].label;
      arrayToReturn.push(report);
    })

    return arrayToReturn;
  }

  shareReportData(report) {
    localStorage.setItem("currentReport", JSON.stringify(report));
  }

  onReportToggle(reportId, isEnabled) {
    this.socketDataService.removeReport({
      report_id: reportId,
      isEnabled: isEnabled,
      param: 3
    });

    this.reportsRemConnection = this.socketDataService.onRemoveReport().subscribe(reportRemResponse => {
      this.reportsRemConnection.unsubscribe();
      if (reportRemResponse) {
        if (isEnabled) {
          this.toastr.info('Report enabled successfully');
        } else {
          this.toastr.info('Report disabled successfully');
        }
      } else {
        if (isEnabled) {
          this.toastr.error('Failed to enable report');
        } else {
          this.toastr.error('Failed to disable report');
        }
      }
      this.reportsSource.adapter.reload(0);
    })
  }

  removeReport(reportId) {
    this.socketDataService.removeReport({
      report_id: reportId,
      param: 2
    });

    this.reportsRemConnection = this.socketDataService.onRemoveReport().subscribe(reportRemResponse => {
      this.reportsRemConnection.unsubscribe();
      if (reportRemResponse) {
        this.toastr.info('Report removed successfully');
        this.reportsSource.adapter.reload(0);
      } else {
        this.toastr.error('Failed to remove report');
      }
    })
  }

  downloadReport(reportId) {

    if (this.disableDownload) {
      // this.toastr.info('Previous download is in progress');
    } else {
      this.disableDownload = true;
      this.toastr.info('Please wait. Download PDF is initiated.');
      this.http.get(window.location.origin + "/ms/reportpdfdownload/v1/" + reportId, { responseType: 'blob' })
        .subscribe((file: Blob) => {
          this.disableDownload = false;
          FileSaver.saveAs(file, reportId);
        }, err => {
          this.toastr.error('PDF download failed');
          this.disableDownload = false;
        });
    }
  }

  scrollbarVisible(id) {
    let element = document.getElementById(id);
    return element.scrollHeight > element.clientHeight;
  }
}
