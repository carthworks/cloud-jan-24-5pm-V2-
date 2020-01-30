import { Subscription } from 'rxjs';
import { Component, OnDestroy, OnInit, HostListener } from '@angular/core';
import { IntercommunicationService } from '../../services/intercommunication.service';
import { SocketdataService } from '../../services/socketdata.service';
@Component({
  selector: 'app-anomplycount',
  templateUrl: './anomplycount.component.html',
  styleUrls: ['./anomplycount.component.css']
})
export class AnomplycountComponent implements OnInit, OnDestroy {
  internalConnection = null;
  totalDevCnt = 0;
  totalOnlineCnt = 0;
  totalVulnerabilityCnt = 0;
  totAbnorDevCnt = 0;
  totalAnomalyCnt = 0;
  connection = null;
  deviceCountEvent = null;
  customer_id: any;
  dropDownChangeEventAnomalyCount: Subscription = null;

  constructor(private intercommunication: IntercommunicationService, private socketservice: SocketdataService) {
    this.customer_id = parseInt(localStorage.getItem('setting_customer_id'));
  }
  ngOnInit(): void {
    // console.log("count iniit")
    localStorage.removeItem('devonnet');

    this.dropDownChangeEventAnomalyCount = this.intercommunication
      .getheaderdropdownClicked()
      .subscribe(info => {
        this.socketservice.requestDeviceInfo();
      });

    this.connection = this.socketservice.getDeviceInfo().subscribe(info => {
      if (!this.isEmpty(info)) {
        if (localStorage.getItem('devonnet')) {
          const previousState = JSON.parse(localStorage.getItem('devonnet'));
          if ((previousState['totDevCnt'] != info['totDevCnt']) || (previousState['onlineDevCnt'] != info['onlineDevCnt']) || (previousState['totIncidentsCnt'] != info['totIncidentsCnt']) || (previousState['totAbnorDevCnt'] != info['totAbnorDevCnt'])) {
            this.totalDevCnt = info['totDevCnt'];
            this.totalOnlineCnt = info['onlineDevCnt'];
            this.totalVulnerabilityCnt = info['totIncidentsCnt'];
            this.totAbnorDevCnt = info['totAbnorDevCnt'];
            this.updateLocalStorage(info);
          }
        } else {
          this.totalDevCnt = info['totDevCnt'];
          this.totalOnlineCnt = info['onlineDevCnt'];
          this.totalVulnerabilityCnt = info['totIncidentsCnt'];
          this.totAbnorDevCnt = info['totAbnorDevCnt'];
          this.updateLocalStorage(info);
        }
      } else {
        // console.log('No data in get Device Info');
      }
    });

    this.deviceCountEvent = this.intercommunication.setupdateDeviceCount().subscribe(info => {
      // console.log(info);
      this.totalDevCnt = info;
    });

  }
  ngOnDestroy() {
    // console.log("anomalycount --> Destroyed");
    this.connection.unsubscribe();
    this.deviceCountEvent.unsubscribe();
    this.dropDownChangeEventAnomalyCount.unsubscribe();
  }
  private isEmpty(obj) {
    // tslint:disable-next-line:forin
    for (const i in obj) {
      return false;
    }
    return true;
  }

  updateLocalStorage(data) {
    localStorage.setItem('devonnet', JSON.stringify(data));
    data.status = true;
    this.intercommunication.sendDeviceInfoUpdate(data);
  }
}
