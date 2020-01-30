import { Injectable } from '@angular/core';
import { SocketdataService } from './socketdata.service';
import { ConnectionConfig } from './ConnectionConfig';
import { Observable, Subject } from 'rxjs';
import { ToastrService } from 'ngx-toastr';

@Injectable()
export class ConnectionHandler {
  constructor(public socketdataService: SocketdataService, private toaster: ToastrService) {}

  private retryCount = new ConnectionConfig().retryCount;
  private retryIndex = 0;

  private retryInterval = new ConnectionConfig().retryInterval;
  private state = true;
  private timer: any;
  private callbackMessage = new Subject<any>();

  public subscribeConnection(service, param) {
    this.reset();

    this.sendSocketService(service, param);
  }

  private sendSocketService(service, param) {
    if (this.state) {
      if (this.retryIndex <= this.retryCount) {
        this.socketdataService[service](param);

        this.timer = setTimeout(() => {
          if (this.state) {
            this.retryIndex++;

            this.sendSocketService(service, param);
          } else {
            this.reset();
          }
        }, this.retryInterval);
      } else {
        this.setCallback(false);
        this.toaster.error('Unable to load device information');
        console.log('unable to get data');
      }
    }
  }

  public unsubscribeConnection() {
    this.setCallback(false);

    this.state = false;
  }

  public reset() {
    clearTimeout(this.timer);
    this.retryIndex = 0;
    this.state = true;
  }

  public setCallback(status) {
    this.callbackMessage.next(status);
  }

  public getCallback(): Observable<any> {
    return this.callbackMessage.asObservable();
  }
}
