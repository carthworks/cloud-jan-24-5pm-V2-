// Angular Core Components
import { NgModule, APP_INITIALIZER } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { HttpClientModule, HttpClient } from '@angular/common/http';
import { RouterModule, Routes } from '@angular/router';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { CdkTableModule } from '@angular/cdk/table';
import { CdkTreeModule } from '@angular/cdk/tree';
import { SelectButtonModule } from 'primeng/selectbutton';

import { TooltipModule } from 'ng2-tooltip-directive';
import { TooltipOptions } from 'ng2-tooltip-directive';

import { NgxSpinnerModule } from 'ngx-spinner';
import { ToastrModule } from 'ngx-toastr';
import { UiScrollModule } from 'ngx-ui-scroll';
import { NgCircleProgressModule } from 'ng-circle-progress';

import { DropdownModule } from 'primeng/dropdown';
import { DialogModule } from 'primeng/dialog';
import { InputTextareaModule } from 'primeng/inputtextarea';
import { ScrollPanelModule } from 'primeng/scrollpanel';
import { RadioButtonModule } from 'primeng/radiobutton';

// Services
import { SocketdataService } from './services/socketdata.service';
import { IntercommunicationService } from './services/intercommunication.service';
import { RestserviceService } from './services/restservice.service';

// Pipes
import { EpochToDatePipe } from './pipes/epoch-to-date.pipe';
import { OnehourconvertPipe } from './pipes/onehourconvert.pipe';
import { ProtocolToTextPipe } from './pipes/protocol-to-text.pipe';
import { IszerolengthPipe } from './pipes/iszerolength.pipe';
import { SafeHtmlPipe } from './pipes/safe-html.pipe';

// primeng components module and all vender componenets
// import { SearchChipsComponent } from './../search-chips/search-chips.component';
import { PrimengModule } from './common/primeng.module';
import { AppComponent } from './app.component';
import { AppRoutingModule, routingComponents } from './app-routing.module';


import { AnomplycountComponent } from './layout/anomplycount/anomplycount.component';
import { EnlargedLivestreamingChartComponent } from './layout/enlarged-livestreaming-chart/enlarged-livestreaming-chart.component';
import { AllDeviceRoutingRoutingModule } from './home/alldevices/alldevice-routing.module';
import { DeviceonnetChartComponent } from './home/alldevices/deviceonnet-chart/deviceonnet-chart.component';
import { AbbrivateBitsPipe } from './pipes/abbrivate-bits.pipe';


import { NgxLoadingModule } from 'ngx-loading';


import { Topology2D } from './home/alldevices/topology/2D/topology-2D.component';
import { Topology3D } from './home/alldevices/topology/3D/topology-3D.component';

import { MapGL } from './home/webgl/services/mapgl.service';
import { CameracontrollerService } from './home/webgl/services/cameracontroller.service';
import { UtilityService } from './home/webgl/services/utility.service';

// Material Modules
import {
  MatToolbarModule,
  MatTableModule,
  MatAutocompleteModule,
  MatInputModule,
  MatFormFieldModule
} from '@angular/material';


import { RootComponent } from './root/root.component';
import { NotfoundComponent } from './home/notfound/notfound.component';
import { TimelineChartComponent } from './home/alldevices/timeline-chart/timeline-chart.component';
import { TermsComponent } from './layout/terms/terms.component';
import { ConfirmDialog, ConfirmationService, InputTextModule, AutoCompleteModule, CalendarModule, InputSwitchModule } from 'primeng/primeng';
import { ProtoToNamePipe } from './pipes/proto-to-name.pipe';
import { FilterUniquePipe } from './pipes/filter-unique.pipe';
import { AuthGuard } from './auth.guard';
import { SettingComponent } from './home/setting/setting.component';
import { UnityAppRegistry } from './home/alldevices/services/UnityAppRegistry.service';
import { UnityService } from './home/alldevices/services/UnityService.service';
import { SessionManagerService } from './home/alldevices/services/session_manager.service';

import { RecaptchaModule } from 'ng-recaptcha';
import { DashboardComponent } from './home/alldevices/dashboard/dashboard.component';
import { ChartModule } from 'primeng/chart';
import { DevicedetailsComponent } from './home/alldevices/devicedetails/devicedetails.component';
import { TextureIDMap } from './home/alldevices/services/TextureIDMap.service';

import { CardModule } from 'primeng/card';
import { TableModule } from 'primeng/table';
import { TabViewModule } from 'primeng/tabview';

import { PreloaderDirective } from './common/preloader.directive';
import { TranslatePipe } from './pipes/translate.pipe';

const appRoutes: Routes = [];
export const MyDefaultTooltipOptions: TooltipOptions = {
  'show-delay': 0,
  'hide-delay': 0,
  'autoPlacement': true,
  'z-index': 1000010,
  'tooltip-class': 'ng2-tooltip-custom',
  'hideDelayAfterClick': 0
}

import { DeviceDetectorModule } from 'ngx-device-detector';
import { ConnectionHandler } from './services/connectionHandler.service';
import { VerifyMaskComponent } from './common/verify-mask/verify-mask.component';
import { IncidentTableComponent } from './home/alldevices/devicedetails/incident-table/incident-table.component';
import { SettingsGuard } from './guards/settings-guard';
import { ReportsComponent } from './home/alldevices/reports/reports.component';
import { ViewReportsComponent } from './home/alldevices/reports/view-reports/view-reports.component';
import { ThreatsComponent } from './home/alldevices/threats/threats.component';
import { SearchInputComponent } from './home/alldevices/threats/search-input/search-input.component';
import { ScrollingModule } from '@angular/cdk/scrolling';
import { AssetsComponent } from './home/alldevices/assets/assets.component';
import { RemediationComponent } from './home/alldevices/remediation/remediation.component';
@NgModule({
  declarations: [
    AppComponent,
    routingComponents,
    Topology2D,
    Topology3D,
    DeviceonnetChartComponent,
    EnlargedLivestreamingChartComponent,
    AnomplycountComponent,
    EpochToDatePipe,
    OnehourconvertPipe,
    ProtocolToTextPipe,
    IszerolengthPipe,
    SafeHtmlPipe,
    AbbrivateBitsPipe,
    SettingComponent,
    PreloaderDirective,
    TranslatePipe,
    RootComponent,
    NotfoundComponent,
    TimelineChartComponent,
    TermsComponent,
    ProtoToNamePipe,
    FilterUniquePipe,
    DashboardComponent,
    DevicedetailsComponent,
    VerifyMaskComponent,
    ReportsComponent,
    ViewReportsComponent,
    IncidentTableComponent,
    ThreatsComponent,
    SearchInputComponent,
    AssetsComponent,
    RemediationComponent
  ],
  imports: [
    BrowserModule,
    CommonModule,
    BrowserAnimationsModule,
    PrimengModule,
    AppRoutingModule,
    FormsModule,
    NgxLoadingModule.forRoot({}),
    NgCircleProgressModule.forRoot({
      "backgroundPadding": 2,
      "radius": 32,
      "space": -5,
      "titleColor": "#ffffff",
      "unitsColor": "#ffffff",
      "outerStrokeWidth": 5,
      "innerStrokeWidth": 5,
      "showSubtitle": false,
      "showBackground": false
    }),
    RouterModule.forRoot(appRoutes),
    HttpClientModule,
    ReactiveFormsModule,
    AllDeviceRoutingRoutingModule,
    CdkTableModule,
    CdkTreeModule,
    MatToolbarModule,
    MatTableModule,
    MatAutocompleteModule,
    MatInputModule,
    MatFormFieldModule,
    NgxSpinnerModule,
    DropdownModule,
    DialogModule,
    TooltipModule.forRoot(MyDefaultTooltipOptions as TooltipOptions),
    InputTextareaModule,
    ScrollPanelModule,
    RadioButtonModule,
    ChartModule,
    UiScrollModule,
    CardModule,
    RecaptchaModule.forRoot(),
    ToastrModule.forRoot({
      timeOut: 3000,
      positionClass: 'toast-top-right',
      messageClass: 'akitra-toastr',
      preventDuplicates: true,
    }),
    InputTextModule,
    AutoCompleteModule,
    TableModule,
    TabViewModule,
    DeviceDetectorModule.forRoot(),
    SelectButtonModule,
    CalendarModule,
    InputSwitchModule,
    ScrollingModule
  ],
  exports: [
    CdkTableModule,
    CdkTreeModule,
    MatToolbarModule,
    MatTableModule

  ],
  providers: [UtilityService, CameracontrollerService, SessionManagerService, AuthGuard, SettingsGuard, TextureIDMap,
    MapGL, RestserviceService, ConfirmationService, IntercommunicationService,
    UnityService, UnityAppRegistry, SocketdataService, ConnectionHandler],
  entryComponents: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
