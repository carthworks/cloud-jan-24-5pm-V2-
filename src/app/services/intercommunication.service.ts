import { Injectable } from "@angular/core";
import { Observable, Subject} from "rxjs";
import { HttpClient } from "@angular/common/http";



@Injectable()
export class IntercommunicationService {
  private settingsOff = new Subject<any>();
  private anomalyTitles = new Subject<any>();
  private deviceInfo = new Subject<any>();
  private selectedEvtInfo = new Subject<any>();
  private updateAnomalyMap = new Subject<any>();
  private updateDeviceHover = new Subject<any>();
  private eventList = new Subject<any>();
  private selectedTile = new Subject<any>();
  private toggleTile = new Subject<any>();
  private backToMainScreen = new Subject<any>();
  private eventPKtDetail = new Subject<any>();
  private eventPKtDetailTableData = new Subject<any>();
  private hideEventLog = new Subject<any>();
  private loginEvent = new Subject<any>();
  private loadScene = new Subject<any>();
  private attachUnityEvent = new Subject<any>();
  private startTimelineEvent = new Subject<any>();
  private recordsEvent = new Subject<any>();
  private pause_playTimelineEvent = new Subject<any>();
  private speedTimelineEvent = new Subject<any>();
  private anomalyLog = new Subject<any>();
  private nodeClicked = new Subject<any>();
  private nodeHover = new Subject<any>();
  private nodeHoverEnd = new Subject<any>();
  private clearRecordEvent = new Subject<any>();
  private sliderChangeEvent = new Subject<any>();
  private cameraChangeEvent = new Subject<any>();
  private deselectLogEvent = new Subject<any>();
  private updateDeviceCount = new Subject<any>();
  private selectedDevInfo = new Subject<any>();
  private subjectDeviceIndex = new Subject<any>();
  private subjectTokenExpiry = new Subject<any>();
  public subjectShowSettingsScreen = new Subject<any>();
  public subjectActivityHours = new Subject<any>();
  public devInfoUpdate = new Subject<any>();
  public clearChartData = new Subject<any>();
  public subjectisShowMainNavi = new Subject<any>(); // main navigation

  private topologyDeviceInfo = new Subject<any[]>();
  private topologyDeviceUpdateInfo = new Subject<any[]>();
  private selectedNodeDetails = new Subject<any[]>();

  private canvasResizeEvent = new Subject<any[]>();
  public dTableRowClicked = new Subject<any>();
  public mapMarkerRemoveEvent = new Subject<any>();
  public mapMarkerAddEvent = new Subject<any>();

  private reloadURL: string = '/home/anomaly/livemap';
 public subjectisEnableSettingGear = new Subject<boolean>();


  // deviceonnet-chart
  public subjectClearChart = new Subject<any>();
  // deviceonnet-chart
  public subjectPostDeviceChartTimes = new Subject<any>();
  private subjectAllDevicesNavigationToggle = new Subject<any>(); // subjectAllDevicesNavigationToggle

  // theming color exchange frmom tile page to all components
  private subjectThemeToggle = new Subject<any>();

  public subjectBacktoEventdetail = new Subject<any>();
  public subjectisShowThreeviewNavi = new Subject<any>();

  public subjectSearchChipenable = new Subject<any>();

  public resetDeviceTable = new Subject<any>();
  public subjectLiveMapLegend = new Subject<any>();

  public subjectclearChip = new Subject<boolean>();
  public subjectPgBg = new Subject<boolean>();
  public subjectisShowTwoviewNavi = new Subject<boolean>();

  public settingEvent = new Subject<boolean>();

  public headerdropdownEvent = new Subject<any>();

  public navigationClickEvent = new Subject<any>();
  public deviceClickEvent = new Subject<any>();
  public subjectDeviceDetailsPopup = new Subject<boolean>();
  
  public _chipRemovable = new Subject<boolean>();

  public _searchQueries = new Subject<any>();

  constructor(private httpClient: HttpClient) { }


  public setNavigationClickEvent(status) {
    this.navigationClickEvent.next(status);
  }

  public getNavigationClickEvent(): Observable<any> {
    return this.navigationClickEvent.asObservable();
  }

  public SetURL(url: string) {
    this.reloadURL = url;
  }
  public GetURL() {
    return this.reloadURL;
  }

  public resetTrafficChartRequest(status) {
    this.clearChartData.next(status);
  }

  public checkResetChartRequest(): Observable<any> {
    return this.clearChartData.asObservable();
  }

  // Activity Hours alldevice first inner table
  // is subjectLiveMapLegend view Navigation
  public SetActivityHours(param) {
    this.subjectActivityHours.next(param);
  }
  public GetActivityHours(): Observable<any> {
    return this.subjectActivityHours.asObservable();
  }
  //devInfoUpdate
  public sendDeviceInfoUpdate(param) {
    this.devInfoUpdate.next(param);
  }
  public getDeviceInfoUpdate(): Observable<any> {
    return this.devInfoUpdate.asObservable();
  }
  public setmapMarkerRemoveEvent(rowObj): any {
    // rowObj['clicked'] = true;
    this.mapMarkerRemoveEvent.next(rowObj);
  }

  public getmapMarkerRemoveEvent(): Observable<any> {
    return this.mapMarkerRemoveEvent.asObservable();
  }

  public setmapMarkerAddEvent(rowObj): any {
    // rowObj['clicked'] = true;
    this.mapMarkerAddEvent.next(rowObj);
  }

  public getmapMarkerAddEvent(): Observable<any> {
    return this.mapMarkerAddEvent.asObservable();
  }


  // Row clicked onthe anomaly datatable state
  public requestRowClickedState(rowObj): any {
    // rowObj['clicked'] = true;
    this.dTableRowClicked.next(rowObj);
  }

  public getRowClickedState(): Observable<any> {
    return this.dTableRowClicked.asObservable();
  }
  

  public setDeviceClickEvent(status): any {
    this.deviceClickEvent.next(status);
  }

  public getDeviceClickEvent(): Observable<boolean> {
    return this.deviceClickEvent.asObservable();
  }

  public settingClicked(status): any {
    this.settingEvent.next(status);
  }

  public getsettingClicked(): Observable<boolean> {
    return this.settingEvent.asObservable();
  }

  public resetChip(status): any {
    this.subjectclearChip.next(status);
  }

  public clearSearchRes(): Observable<boolean> {
    return this.subjectclearChip.asObservable();
  }
  // page bg service
  public setpageBg(status): any {
    this.subjectPgBg.next(status);
  }
  public getpageBg(): Observable<boolean> {
    return this.subjectPgBg.asObservable();
  }


  // page bg service
  public resetTimeLineChart(status): any {
    this.subjectClearChart.next(status);
  }
  public triggerResetTimeLineChart(): Observable<boolean> {
    return this.subjectClearChart.asObservable();
  }


  // Live map legend visibility

  // is subjectLiveMapLegend view Navigation
  public SetLegend(param) {
    this.subjectLiveMapLegend.next(param);
  }
  public GetLegend(): Observable<boolean> {
    return this.subjectLiveMapLegend.asObservable();
  }
  //



  public sendTableResetRequest(param) {
    this.resetDeviceTable.next(param);
  }
  public receiveTableResetRequest(): Observable<boolean> {
    return this.resetDeviceTable.asObservable();
  }

  // is subjectSearchChipenable view Navigation
  public SetSearchChipenable(param) {
    this.subjectSearchChipenable.next(param);
  }
  public GetSearchChipenable(): Observable<boolean> {
    return this.subjectSearchChipenable.asObservable();
  }
  // --------------------------------

 // is devicedetails popup closes - to reset the table
 public SetDeviceDetailsPopup(param: boolean) {
  this.subjectDeviceDetailsPopup.next(param);
}
public GetDeviceDetailsPopup(): Observable<boolean> {
  return this.subjectDeviceDetailsPopup.asObservable();
}
// --------------------------------



 // is enable Settings Gear popup closes - to reset dgear
 public enableSettingsGear(param: boolean) {
  this.subjectisEnableSettingGear.next(param);
}
public disableSettingsGear(): Observable<boolean> {
  return this.subjectisEnableSettingGear.asObservable();
}
// --------------------------------



  // is Show Two view MAIN Navigation, land and All devices
  public SetIsShowMainNavi(param) {
    this.subjectisShowMainNavi.next(param);
  }
  public GetIsShowMainNavi(): Observable<any> {
    return this.subjectisShowMainNavi.asObservable();
  }
  //


  // is Show Two view Navigation, livemal  and history
  public SetIsShowTwoviewNavi(param) {
    this.subjectisShowTwoviewNavi.next(param);
  }
  public GetIsShowTwoviewNavi(): Observable<any> {
    return this.subjectisShowTwoviewNavi.asObservable();
  }
  // --------------------------------

  // event details back to
  public SetBacktoEventdetail(param) {
    this.subjectBacktoEventdetail.next(param);
  }

  public GetBacktoEventdetail(): Observable<any[]> {
    return this.subjectBacktoEventdetail.asObservable();
  };

  public selectedDeviceInfo(data) {
    this.selectedDevInfo.next(data);
  }

  public getSelectedDeviceInfo(): Observable<any> {
    return this.selectedDevInfo.asObservable();
  }

  public selectedEventInfo(data) {
    this.selectedEvtInfo.next(data);
  }

  public getSelectedeventInfo(): Observable<any> {
    return this.selectedEvtInfo.asObservable();
  }

  // theming color exchange frmom tile page to all components
  public setThemeColor(data) {
    // alert(data);
    this.subjectThemeToggle.next(data);
  }

  public getThemeColor(): Observable<any> {
    return this.subjectThemeToggle.asObservable();
  }


  public headerdropdownClicked(status): any {
    this.headerdropdownEvent.next(status);
  }

  public getheaderdropdownClicked(): Observable<any> {
    return this.headerdropdownEvent.asObservable();
  }


  public SetcanvasResize0(param) {
    this.canvasResizeEvent.next(param);
  }

  public GetcanvasResize0(): Observable<any[]> {
    return this.canvasResizeEvent.asObservable();
  };



  // public GetcanvasResize(): Observable<any[]> {
  //   return this.canvasResizeEvent.asObservable();
  // };

  setAllDevicesNavigationToggle(data) {
    this.subjectAllDevicesNavigationToggle.next(data);
  }
  getAllDevicesNavigationToggle(): Observable<any> {
    return this.subjectAllDevicesNavigationToggle.asObservable();
  }


  setSettingsOffEvent(data) {
    this.settingsOff.next(data);
  }


  public SetcanvasResize(param) {
    this.canvasResizeEvent.next(param);
  }

  public GetcanvasResize(): Observable<any[]> {
    return this.canvasResizeEvent.asObservable();
  };

  public RequestTopologyDeviceInfo(param) {
    this.topologyDeviceInfo.next(param);
  }

  public GetTopologyDeviceInfo(): Observable<any[]> {
    return this.topologyDeviceInfo.asObservable();
  };
  getSettingsOffEvent(): Observable<any> {
    // publiser
    return this.settingsOff.asObservable();
  }



  // Deviceonnet chart Start and end time value : deviceonnet-chart.component.ts

  setsubjectPostDeviceChartTimes(data) {  // receiver
    // alert(data);
    this.subjectPostDeviceChartTimes.next(data);
  }

  getsubjectPostDeviceChartTimes(): Observable<any> {   // publiser
    return this.subjectPostDeviceChartTimes.asObservable();
  }



  //  To enable setting page , receiver
  setShowSettingsScreen(data) {
    this.subjectShowSettingsScreen.next(data);
  }

  getShowSettingsScreen(): Observable<any> {
    // publicser
    return this.subjectShowSettingsScreen.asObservable();
  }

  getupdateDeviceCount(data) {
    this.updateDeviceCount.next(data);
  }

  setupdateDeviceCount(): Observable<any> {
    return this.updateDeviceCount.asObservable();
  }

  isLoginDetails(data) {
    this.loginEvent.next(data);
  }

  passLoginDetails(): Observable<any> {
    return this.loginEvent.asObservable();
  }

  hideEventDetails(data) {
    this.hideEventLog.next(data);
  }

  getHideEventDetailsEvent(): Observable<any> {
    return this.hideEventLog.asObservable();
  }

  sendEventPKtDetailTableData(data) {
    this.eventPKtDetailTableData.next(data);
  }

  getEventPKtDetailTableData(): Observable<any> {
    return this.eventPKtDetailTableData.asObservable();
  }

  requestEventPKtDetail(data) {
    this.eventPKtDetail.next(data);
  }

  getEventPKtDetail(): Observable<any> {
    return this.eventPKtDetail.asObservable();
  }

  backToMainScreenEvent(data) {
    this.backToMainScreen.next(data);
  }

  getBackToMainScreenEvent(): Observable<any> {
    return this.backToMainScreen.asObservable();
  }

  toggleLeftPane(data) {
    this.toggleTile.next(data);
  }

  getTogglePane(): Observable<any> {
    return this.toggleTile.asObservable();
  }

  selectedAnomalyTitle(data) {
    this.selectedTile.next(data);
  }

  getSelectedAnomalyTile(): Observable<any> {
    return this.selectedTile.asObservable();
  }

  setNodeClicked(data) {
    this.nodeClicked.next(data);
  }

  getNodeClicked(): Observable<any> {
    return this.nodeClicked.asObservable();
  }

  setNodeHover(data) {
    this.nodeHover.next(data);
  }

  getNodeHover(): Observable<any> {
    return this.nodeHover.asObservable();
  }

  setNodeHoverEnd(data) {
    this.nodeHoverEnd.next(data);
  }

  getNodeHoverEnd(): Observable<any> {
    return this.nodeHoverEnd.asObservable();
  }

  setClearRecord(data) {
    this.clearRecordEvent.next(data);
  }

  getClearRecord(): Observable<any> {
    return this.clearRecordEvent.asObservable();
  }

  setInterMediateSliderChange(data) {
    this.sliderChangeEvent.next(data);
  }

  getInterMediateSliderChange(): Observable<any> {
    return this.sliderChangeEvent.asObservable();
  }

  setCameraChange(data) {
    this.cameraChangeEvent.next(data);
  }

  getCameraChange(): Observable<any> {
    return this.cameraChangeEvent.asObservable();
  }

  setDeselectLog(data) {
    this.deselectLogEvent.next(data);
  }

  getDeselectLog(): Observable<any> {
    return this.deselectLogEvent.asObservable();
  }

  loadUnityScene(data) {
    this.loadScene.next(data);
  }

  pushUnityScene(): Observable<any> {
    return this.loadScene.asObservable();
  }

  setStartTimeLine(data) {
    this.startTimelineEvent.next(data);
  }

  getStartTimeLine(): Observable<any> {
    return this.startTimelineEvent.asObservable();
  }
  setRecords(data) {
    this.recordsEvent.next(data);
  }

  getRecords(): Observable<any> {
    return this.recordsEvent.asObservable();
  }
  setAttachUnityEvent(data) {
    this.attachUnityEvent.next(data);
  }

  getAttachUnityEvent(): Observable<any> {
    return this.attachUnityEvent.asObservable();
  }

  setPause_PlayTimeLine(data) {
    this.pause_playTimelineEvent.next(data);
  }

  getPause_PlayTimeLine(): Observable<any> {
    return this.pause_playTimelineEvent.asObservable();
  }

  setSpeedTimeLine(data) {
    this.speedTimelineEvent.next(data);
  }

  getSpeedTimeLine(): Observable<any> {
    return this.speedTimelineEvent.asObservable();
  }

  pushAnomalyEventLog(data) {
    this.anomalyLog.next(data);
  }

  getAnomalyEventLog(): Observable<any> {
    return this.anomalyLog.asObservable();
  }

  updateAnomalyTiles(data) {
    this.anomalyTitles.next(data);
  }

  getUpdatedAnomalyTitlesInfo(): Observable<any> {
    return this.anomalyTitles.asObservable();
  }

  updateDeviceInfo(data) {
    // console.log("---> data")
    this.deviceInfo.next(data);
  }

  getupdatedDeviceInfo(): Observable<any> {
    return this.deviceInfo.asObservable();
  }

  updateAnomalyMapComp(data) {
    this.updateAnomalyMap.next(data);
  }

  getupdatedAnomalyMapInfo(): Observable<any> {
    return this.updateAnomalyMap.asObservable();
  }

  updateDeviceHoverEvent(data) {
    this.updateDeviceHover.next(data);
  }

  getUpdateDeviceHover(): Observable<any> {
    return this.updateDeviceHover.asObservable();
  }

  // ---------------------------
  setDeviceIndex(deviceIndex: any) {
    this.subjectDeviceIndex.next(deviceIndex);
  }

  getDeviceIndex(): Observable<any> {
    return this.subjectDeviceIndex.asObservable();
  }
  tokenExpired() {
    this.subjectTokenExpiry.next(true);
  }

  sendTokenExpired() {
    return this.subjectTokenExpiry.asObservable();
  }

  public setChipRemovable(param) {
    this._chipRemovable.next(param);
  }
  public getChipRemovable(): Observable<boolean> {
    return this._chipRemovable.asObservable();
  }

  public setSearchQueries(param) {
    this._searchQueries.next(param);
  }
  public getSearchQueries(): Observable<boolean> {
    return this._searchQueries.asObservable();
  }
}
