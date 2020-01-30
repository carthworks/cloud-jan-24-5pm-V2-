import { Component, OnInit, Input } from '@angular/core';
import { AppComponent } from 'src/app/app.component';
import { Datasource, IDatasource } from 'ngx-ui-scroll';
import { ConnectionHandler } from 'src/app/services/connectionHandler.service';
import { Subscription } from 'rxjs';
import { SocketdataService } from 'src/app/services/socketdata.service';

import * as moment from 'moment';
@Component({
  selector: 'app-incident-table',
  templateUrl: './incident-table.component.html',
  styleUrls: ['./incident-table.component.css']
})
export class IncidentTableComponent implements OnInit {
  isScrollable: boolean;
  isTablet: boolean;

  lazySource: any;
  lazyConnection: Subscription = null;
  lazyLoading: boolean = false;
  lazyDataNotAvail: boolean = false;

  _currentIncident: any = {};

  @Input() set currentIncident(value: number) {
    this._currentIncident = value;
    if (this.lazySource.adapter.isInitialized) {
      this.lazySource.adapter.reload(0);
      // console.log(this._currentIncident);
    }
  }

  constructor(
    public app: AppComponent,
    private connectionHandler: ConnectionHandler,
    private socketdataservice: SocketdataService
  ) {
    this.lazySource = new Datasource({
      get: (index, count, success) => {
        let param: any = {};
        param['start'] = index;
        param['length'] = count;
        param['master_id'] = this._currentIncident.master_id;
        param['timestamp'] = this._currentIncident.timestamp;
        param['license_key'] = this._currentIncident.license_key;

        this.lazyLoading = true;
        this.connectionHandler.subscribeConnection(
          'getTiePacketInfo',
          param
        );

        this.lazyConnection = this.socketdataservice.onTiePacketInfo().subscribe(info => {

          this.connectionHandler.unsubscribeConnection();
          this.lazyConnection.unsubscribe();

          // console.log(info);

          if (info['packetinfo'] === undefined || info['packetinfo'].length == 0) {
            if (this.lazySource.adapter.itemsCount === 0) {
              this.lazyDataNotAvail = true;
            } else {
              success([]);
            }
            this.lazyLoading = false;
          } else {
            const packetinfo = info['packetinfo'];

            success(this.updateDataTableLazy(packetinfo));

            setTimeout(() => {
              this.isScrollable = this.scrollbarVisible('lazy-tab-scroll');
            }, 100)

            this.lazyDataNotAvail = false;
            this.lazyLoading = false;
          }
        });
      },
      settings: {
        bufferSize: 15,
        minIndex: 0,
        startIndex: 0
      }
    });
  }

  ngOnInit() {
    this.isTablet = !this.app.isSettingsDownloadEnable;
  }

  ngAfterViewInit() {

  }

  public updateDataTableLazy(packetinfo) {
    let arrayToReturn: any[] = [];
    packetinfo.map((packet: any) => {
      packet.time = moment.unix(packet.timestamp).format('MMM Do YYYY h:mm:ss a')
      arrayToReturn.push(packet)
    });

    return arrayToReturn;
  }

  scrollbarVisible(id) {
    let element = document.getElementById(id);
    return element.scrollHeight > element.clientHeight;
  }

}
