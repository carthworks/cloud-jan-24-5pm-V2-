import { Injectable } from '@angular/core';
import { Observable, Subject } from 'rxjs';
import * as io from 'socket.io-client';
import { IntercommunicationService } from './intercommunication.service';

@Injectable()
export class SocketdataService {
  constructor(public intercommunication: IntercommunicationService) { }
  private url = window.location.origin;
  private socket = io(this.url, {
    upgrade: false,
    transports: ['websocket'],
    forceNew: true
  });

  private topologyDeviceInfo = new Subject<any[]>();
  private topologyDeviceUpdateInfo = new Subject<any[]>();
  private selectedNodeDetails = new Subject<any[]>();

  crowdSourcing(parameter) {
    parameter['token'] = localStorage.getItem('token');
    parameter['customer_id'] = parseInt(localStorage.getItem('customer_id'));

    this.socket.emit('crowdSourcing', parameter);
  }

  getcrowdSourcing() {
    const observable = new Observable(observer => {
      this.socket.on('crowdSourcingRes', data => {
        observer.next(data);
      });
    });
    return observable;
  }

  getDevOverView(parameter) {
    parameter['customer_id'] = parseInt(localStorage.getItem('customer_id'));
    this.socket.emit('getDevOverView', parameter);
  }

  setDevOverView() {
    const observable = new Observable(observer => {
      this.socket.on('DevOverView', data => {
        observer.next(data);
      });
    });
    return observable;
  }

  getTopologyUpdate(parameter) {
    parameter['customer_id'] = parseInt(localStorage.getItem('customer_id'));
    this.socket.emit('getNwTopologyUpdate', parameter);
  }

  getDevTimeLine(parameter) {
    parameter['customer_id'] = parseInt(localStorage.getItem('customer_id'));
    this.socket.emit('getDevTimeLine', parameter);
  }

  setDevTimeLine() {
    const observable = new Observable(observer => {
      this.socket.on('DevTimeLine', data => {
        observer.next(data);
      });
    });
    return observable;
  }
  setTopologyLive() {
    const observable = new Observable(observer => {
      this.socket.on('nwTopologyUpdate', data => {
        observer.next(data);
      });
    });
    return observable;
  }
  enableMonitoring(parameter) {
    parameter['token'] = localStorage.getItem('token');
    this.socket.emit('enableMonitoring', parameter);
  }

  requestNodeDetails(parameter) {
    parameter['token'] = localStorage.getItem('token');
    parameter['customer_id'] = parseInt(localStorage.getItem('customer_id'));
    this.socket.emit('requestNodeDetails', parameter);
  }

  getNodeDetails() {
    const observable = new Observable(observer => {
      this.socket.on('topologyNodeInfo', data => {
        observer.next(data);
      });
    });
    return observable;
  }

  requestNetflowDataSumm(parameter) {
    parameter['token'] = localStorage.getItem('token');
    this.socket.emit('getNetflowDataSumm', parameter);
  }

  getNetflowDataSumm() {
    const observable = new Observable(observer => {
      this.socket.on('NetflowDataSumm', data => {
        observer.next(data);
      });
    });
    return observable;
  }

  // requestSearchResults(parameter) {
  //   var parameters = {};
  //   parameters['token'] = localStorage.getItem('token');
  //   parameters['searchQuery'] = parameter;
  //   parameters['customer_id'] = parseInt(localStorage.getItem('customer_id_host'));
  //   this.socket.emit('searchDeviceDevRequest', parameters);
  // }

  requestSearchResults(parameters) {
    parameters['customer_id'] = parseInt(localStorage.getItem('customer_id_host'));
    parameters['token'] = localStorage.getItem('token');
    parameters['isExactMatch'] = (localStorage.getItem('isExactMatch') == 'true');
    parameters['collector_id'] = localStorage.getItem('selected_collecter');

    if(parameters['device_id']){
      parameters['searchQuery'] = [];
    }
    this.socket.emit('searchDeviceDevRequest', parameters);
  }

  getSearchResults() {
    const observable = new Observable(observer => {
      this.socket.on('searchDeviceDevResponse', data => {
        observer.next(data);
      });
    });
    return observable;
  }

  requestDetailedChart(parameter) {
    parameter['token'] = localStorage.getItem('token');
    this.socket.emit('getStreamingDataAllDev', parameter);
  }

  getDetailedChart() {
    const observable = new Observable(observer => {
      this.socket.on('streamingDataAllDev', data => {
        observer.next(data);
      });
    });
    return observable;
  }

  requestAllAnnomalyDevInfo(parameter) {
    parameter['token'] = localStorage.getItem('token');
    this.socket.emit('getAllAnnomalyDev', parameter);
  }

  getAllAnnomalyDevInfo() {
    const observable = new Observable(observer => {
      this.socket.on('totAnnomalyDevList', data => {
        //  data.clicked = true;
        observer.next(data);
      });
    });
    return observable;
  }
  requestOpenPorts(parameter) {
    parameter['token'] = localStorage.getItem('token');
    this.socket.emit('getOpenPortInfo', parameter);
  }

  getOpenPortsData() {
    const observable = new Observable(observer => {
      this.socket.on('OpenPorts', data => {
        observer.next(data);
      });
    });
    return observable;
  }
  getSettings() {
    const observable = new Observable(observer => {
      this.socket.on('Settings', data => {
        if (data.hasOwnProperty('ERROR')) {
          this.intercommunication.tokenExpired();
        } else {
          observer.next(data);
        }
      });
    });
    return observable;
  }

  setdashboard(parameters) {
    parameters['collector_id'] = localStorage.getItem('selected_collecter');
    if (parameters['collector_id'] != null) {
      this.socket.emit('getDashboardData', parameters);
    }
  }

  getdashboard() {
    const observable = new Observable(observer => {
      this.socket.on('dashboardData', data => {
        observer.next(data);
      });
    });
    return observable;
  }

  requestBotDeviceInfo(parameters) {
    parameters['token'] = localStorage.getItem('token');
    this.socket.emit('getBotDetails', parameters);
  }

  getBotDeviceInfo() {
    const observable = new Observable(observer => {
      this.socket.on('deviceBotnetInfo', data => {
        observer.next(data);
      });
    });
    return observable;
  }

  // History page calls
  requestAnomalyDevice(parameter) {
    parameter['token'] = localStorage.getItem('token');
    this.socket.emit('getAnomalyDeviceData', parameter);
  }

  getAnomalyDeviceData() {
    const observable = new Observable(observer => {
      this.socket.on('AnomalyDeviceData', data => {
        observer.next(data);
      });
    });
    return observable;
  }

  getNetworkTopologyDevInfo() {
    const observable = new Observable(observer => {
      this.socket.on('DevDataNwTopology', data => {
        observer.next(data);
      });
    });
    return observable;
  }
  getNetworkTopologyDevInfoUpdate() {
    const observable = new Observable(observer => {
      this.socket.on('nwTopoDeviceDataUpdate', data => {
        observer.next(data);
      });
    });
    return observable;
  }

  requestDeviceSessionChartData(parameter) {
    parameter['token'] = localStorage.getItem('token');
    this.socket.emit('getSessionChartData', parameter);
  }

  getDeviceSessionChartData() {
    const observable = new Observable(observer => {
      this.socket.on('sessionDataForChart', data => {
        observer.next(data);
      });
    });
    return observable;
  }

  requestAllDeviceData(parameter) {
    parameter['customer_id'] = parseInt(localStorage.getItem('customer_id_host'));
    parameter['token'] = localStorage.getItem('token');
    parameter['collector_id'] = localStorage.getItem('selected_collecter');
    this.socket.emit('getAllDeviceInfo', parameter);
  }

  // requestAllDeviceData_New() {
  //   var parameter={};
  //   parameter['token'] = localStorage.getItem('token');
  //   parameter['customer_id']=parseInt(localStorage.getItem('customer_id'));
  //   this.socket.emit('getAllDeviceInfo', parameter);
  // }

  getAllDeviceData() {
    const observable = new Observable(observer => {
      this.socket.on('assetStatics', data => {
        observer.next(data);
      });
    });
    return observable;
  }

  getTiePacketInfo(parameter) {
    parameter['customer_id'] = parseInt(localStorage.getItem('customer_id_host'));
    parameter['token'] = localStorage.getItem('token');
    this.socket.emit('getTiePacketInfo', parameter);
  }

  onTiePacketInfo() {
    const observable = new Observable(observer => {
      this.socket.on('tiePacketInfo', data => {
        observer.next(data);
      });
    });
    return observable;
  }

  requestAnomlayStateChange(parameter) {
    parameter['token'] = localStorage.getItem('token');
    this.socket.emit('updateDevAnomalyState', parameter);
  }

  getAnomlayStateChange(parameter) {
    const observable = new Observable(observer => {
      this.socket.on('anomalystate', data => {
        observer.next(data);
      });
    });
    return observable;
  }

  requestSliderDataByInterval(parameter) {
    parameter['token'] = localStorage.getItem('token');
    this.socket.emit('getAnomalySliderData', parameter);
  }

  requestTimeLine(parameter) {
    parameter['token'] = localStorage.getItem('token');
    this.socket.emit('getAnomalySliderLimit', parameter);
  }

  getTimeLineInterval() {
    const observable = new Observable(observer => {
      this.socket.on('sliderTimeLimit', data => {
        observer.next(data);
      });
    });
    return observable;
  }

  requestEventLogDetail(parameter) {
    parameter['token'] = localStorage.getItem('token');
    this.socket.emit('getEventLogDetail', parameter);
  }

  requestNetFlowData(parameter) {
    parameter['token'] = localStorage.getItem('token');
    this.socket.emit('getNetflowData', parameter);
  }

  // demo purpose reset anomaly button
  requestClearAnomayData() {
    const parameters = {};
    parameters['token'] = localStorage.getItem('token');
    this.socket.emit('deleteAllanomaly', parameters);
  }

  getrequestClearAnomayData() {
    const observable = new Observable(observer => {
      this.socket.on('delAllAnomalyResp', data => {
        // ["delAllAnomalyResp",{"isDeleted":true}]
        observer.next(data);
      });
    });
    return observable;
  }

  getEventLogDetail() {
    const observable = new Observable(observer => {
      this.socket.on('EventLogDetail', data => {
        observer.next(data);
      });
    });
    return observable;
  }
  getSliderEventLogUpdate() {
    const observable = new Observable(observer => {
      this.socket.on('sliderSummaryData', data => {
        observer.next(data);
      });
    });
    return observable;
  }

  requestEventLogAnomalyHis(parameter) {
    parameter['token'] = localStorage.getItem('token');
    this.socket.emit('getEventLogDetailAnomalyHis', parameter);
  }

  getEventLogDetailAnomalyHis() {
    const observable = new Observable(observer => {
      this.socket.on('summaryDataAnomalyHis', data => {
        observer.next(data);
      });
    });
    return observable;
  }
  requestBotEventLog(parameter) {
    parameter['token'] = localStorage.getItem('token');
    this.socket.emit('getBotEventLog', parameter);
  }
  requestEventLog(parameter: any) {
    parameter['token'] = localStorage.getItem('token');
    this.socket.emit('getEventLog', parameter);
  }

  requestSliderRangeCnt(parameter: any) {
    parameter['token'] = localStorage.getItem('token');
    this.socket.emit('getSliderRangeCnt', parameter);
  }
  getSliderRange() {
    const observable = new Observable(observer => {
      this.socket.on('sliderRangeCnt', data => {
        observer.next(data);
      });
    });
    return observable;
  }

  requestDevAnomaly(parameter: any) {
    parameter['token'] = localStorage.getItem('token');
    this.socket.emit('getDevAnomaly', parameter);
  }

  requestPktReplay(parameter: any) {
    parameter['token'] = localStorage.getItem('token');
    this.socket.emit('getPktReplay', parameter);
  }

  requestStreamingData(parameter: any) {
    parameter['token'] = localStorage.getItem('token');
    parameter['customer_id'] = parseInt(localStorage.getItem('customer_id'));
    this.socket.emit('getStreamingData', parameter);
  }

  // requestDevInfoNetworkTopology() {
  //   var parameter = {};
  //   parameter['token'] = localStorage.getItem('token');
  //   this.socket.emit('getDevDataNwTopology', parameter);
  // }

  requestDevInfoNetworkTopology() {
    var parameter = {};
    parameter['token'] = localStorage.getItem('token');
    parameter['customer_id'] = parseInt(localStorage.getItem('customer_id'));
    this.socket.emit('getDevDataNwTopology', parameter);
  }

  requstDevDataNwTopologyUpdate(parameter: any) {
    parameter['token'] = localStorage.getItem('token');
    parameter['customer_id'] = parseInt(localStorage.getItem('customer_id'));
    this.socket.emit('getDevDataNwTopologyUpdate', parameter);
  }

  requestDeviceInfo() {
    var parameter = {};
    parameter['token'] = localStorage.getItem('token');
    parameter['customer_id'] = parseInt(localStorage.getItem('customer_id_host'));
    parameter['collector_id'] = localStorage.getItem('selected_collecter');
    if (parameter['collector_id'] != null) {
      this.socket.emit('getDevData', parameter);
    }
  }

  getDeviceInfo() {
    const observable = new Observable(observer => {
      this.socket.on('devData', data => {
        if (data.hasOwnProperty('ERROR')) {
          this.intercommunication.tokenExpired();
        } else {
          observer.next(data);
        }
      });
    });
    return observable;
  }

  isDevInfoUpdateRequired(data: any, currendata: any) {
    const countInfo = {};
    const victimDevices = currendata['victimDevices'];
    const attackerDevInfo = currendata['anomalyDevices'];
    let tmpAttacker = attackerDevInfo;
    tmpAttacker = tmpAttacker.filter(dev => !victimDevices.includes(dev));
    countInfo['totalDevCnt'] = currendata['deviceCountInfo']['total'];
    countInfo['totalAnomalyCnt'] = victimDevices.length + tmpAttacker.length;
    if (data['totalDevCnt'] !== countInfo['totalDevCnt']) {
      return true;
    }
    if (data['totalAnomalyCnt'] !== countInfo['totalAnomalyCnt']) {
      return true;
    }
    return false;
  }

  getStreamingData() {
    const observable = new Observable(observer => {
      this.socket.on('StreamingData', data => {
        if (data.hasOwnProperty('ERROR')) {
          this.intercommunication.tokenExpired();
        } else {
          if (data.length > 0) {
            if (data.length > 1) {
              localStorage.setItem('streamingStartTime', data[1].id);
            } else if (data.length === 1) {
              localStorage.setItem('streamingStartTime', data[0].id);
            }
          }
          observer.next(data);
        }
      });
    });
    return observable;
  }

  requestFlowOverView(parameters) {
    parameters['token'] = localStorage.getItem('token');
    this.socket.emit('flowOverView', parameters);
  }

  getFlowOverView() {
    const observable = new Observable(observer => {
      this.socket.on('summaryOverView', data => {
        observer.next(data);
      });
    });
    return observable;
  }

  requestflowBotOverView(parameters) {
    parameters['token'] = localStorage.getItem('token');
    this.socket.emit('flowBotOverView', parameters);
  }

  requestflowBotOverViewInterval(parameters) {
    parameters['token'] = localStorage.getItem('token');
    this.socket.emit('flowBotOverViewInterval', parameters);
  }
  requestflowOverViewInterval(parameters) {
    parameters['token'] = localStorage.getItem('token');
    this.socket.emit('flowOverViewInterval', parameters);
  }

  getDeviceAnomaly() {
    const observable = new Observable(observer => {
      this.socket.on('deviceAnomaly', data => {
        observer.next(data);
      });
    });
    return observable;
  }

  getEventLogUpdate() {
    const observable = new Observable(observer => {
      this.socket.on('summaryData', data => {
        observer.next(data);
      });
    });
    return observable;
  }

  getNetFlowDataUpdate() {
    const observable = new Observable(observer => {
      this.socket.on('netflowData', data => {
        observer.next(data);
      });
    });
    return observable;
  }

  getPktReplayResponse() {
    const observable = new Observable(observer => {
      this.socket.on('pktReplayResponse', data => {
        observer.next(data);
      });
    });
    return observable;
  }

  // Module log : new api call from  old ui
  requestModuleLog(parameter: any) {
    parameter['token'] = localStorage.getItem('token');
    this.socket.emit('getModuleLog', parameter);
  }

  getModuleLog() {
    const observable = new Observable(observer => {
      // setInterval(function(){ observer.next('log'); }, 3000);

      this.socket.on('moduleLog', data => {
        if (data.hasOwnProperty('ERROR')) {
          this.intercommunication.tokenExpired();
        } else {
          observer.next(data.trim());
        }
      });
    });
    return observable;
  }

  requestModuleStatus(parameters) {
    parameters['token'] = localStorage.getItem('token');
    this.socket.emit('getModuleStatus', parameters);
  }

  getModuleStatus() {
    const observable = new Observable(observer => {
      this.socket.on('moduleStatus', data => {
        if (data.hasOwnProperty('ERROR')) {
          this.intercommunication.tokenExpired();
        } else {
          observer.next(data);
        }
      });
    });
    return observable;
  }

  requestSettings(parameter) {
    this.socket.emit('getSettings', parameter);
  }

  requestClearDeviceOnNetData() {
    const parameters = {};
    parameters['token'] = localStorage.getItem('token');
    this.socket.emit('deleteAlldevicesOnNet', parameters);
  }

  saveSettings(parameters) {
    parameters['token'] = localStorage.getItem('token');
    this.socket.emit('saveSettings', parameters);
  }

  getsaveSettings() {
    const observable = new Observable(observer => {
      this.socket.on('saveSettings', data => {
        //  console.log(data)
        observer.next(data);
      });
    });
    return observable;
  }

  public RequestTopologyDeviceInfo(param) {
    this.topologyDeviceInfo.next(param);
  }

  public GetTopologyDeviceInfo(): Observable<any[]> {
    return this.topologyDeviceInfo.asObservable();
  }

  public RequestUpdatedTopologyDeviceInfo(param) {
    this.topologyDeviceUpdateInfo.next(param);
  }

  public GetUpdatedTopologyDeviceInfo(): Observable<any[]> {
    return this.topologyDeviceUpdateInfo.asObservable();
  }

  public RequestSelectedNodeDetails(param) {
    this.selectedNodeDetails.next(param);
  }

  public GetSelectedNodeDetails(): Observable<any[]> {
    return this.selectedNodeDetails.asObservable();
  }

  setchangePassword(parameters) {
    this.socket.emit('changePassword', parameters);
  }

  getchangePassword() {
    const observable = new Observable(observer => {
      this.socket.on('changePassword', data => {
        if (data.hasOwnProperty('ERROR')) {
          this.intercommunication.tokenExpired();
        } else {
          observer.next(data);
        }
      });
    });
    return observable;
  }

  setCustomerList(parameter) {
    parameter['token'] = localStorage.getItem('token');
    // parameter['setting_customer_id']=parseInt(localStorage.getItem('customer_id'));
    this.socket.emit('getCustomerList', parameter);
  }

  getCustomerList() {
    const observable = new Observable(observer => {
      this.socket.on('customerList', data => {
        if (data.hasOwnProperty('ERROR')) {
          this.intercommunication.tokenExpired();
        } else {
          observer.next(data);
        }
      });
    });
    return observable;
  }

  getReportInfo(parameter) {
    parameter['customer_id'] = parseInt(localStorage.getItem('customer_id_host'));
    parameter['token'] = localStorage.getItem('token');
    parameter['collector_id'] = localStorage.getItem('selected_collecter');
    this.socket.emit('getReportInfo', parameter);
  }

  onReportInfo() {
    const observable = new Observable(observer => {
      this.socket.on('reportInfo', data => {
        observer.next(data);
      });
    });
    return observable;
  }

  getReportGen(parameter) {
    parameter['customer_id'] = parseInt(localStorage.getItem('customer_id_host'));
    parameter['token'] = localStorage.getItem('token');
    parameter['collector_id'] = localStorage.getItem('selected_collecter');
    this.socket.emit('getReportGen', parameter);
  }

  onReportGen() {
    const observable = new Observable(observer => {
      this.socket.on('reportGen', data => {
        observer.next(data);
      });
    });
    return observable;
  }

  removeReport(parameter) {
    parameter['customer_id'] = parseInt(localStorage.getItem('customer_id_host'));
    parameter['token'] = localStorage.getItem('token');
    this.socket.emit('modifyReport', parameter);
  }

  onRemoveReport() {
    const observable = new Observable(observer => {
      this.socket.on('modifyReport', data => {
        observer.next(data);
      });
    });
    return observable;
  }

  getThreatInfo(parameter) {
    parameter['customer_id'] = parseInt(localStorage.getItem('customer_id_host'));
    parameter['token'] = localStorage.getItem('token');
    parameter['collector_id'] = localStorage.getItem('selected_collecter');
    this.socket.emit('getThreatInfo', parameter);
  }

  onThreatInfo() {
    const observable = new Observable(observer => {
      this.socket.on('threatInfo', data => {
        observer.next(data);
      });
    });
    return observable;
  }

  getThreatTableInfo(parameter) {
    parameter['customer_id'] = parseInt(localStorage.getItem('customer_id_host'));
    parameter['token'] = localStorage.getItem('token');
    parameter['collector_id'] = localStorage.getItem('selected_collecter');
    this.socket.emit('getAllIncTableInfo', parameter);
  }

  onThreatTableInfo() {
    const observable = new Observable(observer => {
      this.socket.on('incidentTableInfo', data => {
        observer.next(data);
      });
    });
    return observable;
  }
}
