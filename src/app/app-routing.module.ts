import { AuthGuard } from './auth.guard';
import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { LoginComponent } from './login/login.component';
import { AlldevicesComponent } from './home/alldevices/alldevices.component';
import { HeaderComponent } from './layout/header/header.component';
import { FooterComponent } from './layout/footer/footer.component';

import { TermsComponent } from './layout/terms/terms.component';
import { SettingComponent } from './home/setting/setting.component';
import { Topology2D } from './home/alldevices/topology/2D/topology-2D.component';
import { Topology3D } from './home/alldevices/topology/3D/topology-3D.component';
import { DashboardComponent } from './home/alldevices/dashboard/dashboard.component';
import { SettingsGuard } from './guards/settings-guard';
import { ReportsComponent } from './home/alldevices/reports/reports.component';
import { ViewReportsComponent } from './home/alldevices/reports/view-reports/view-reports.component';
import { ThreatsComponent } from './home/alldevices/threats/threats.component';
import { AssetsComponent } from './home/alldevices/assets/assets.component';
import { RemediationComponent } from './home/alldevices/remediation/remediation.component';

const routes: Routes = [
  // { path: '', redirectTo: 'login', pathMatch: 'full' },
  { path: '', redirectTo: 'login', pathMatch: 'full' },
  // { path: '**', component: LoginComponent },
  { path: 'login', component: LoginComponent },
  { path: 'verify', component: LoginComponent },
  { path: 'terms', component: TermsComponent, canActivate: [AuthGuard] },
  {
    path: 'alldevices', component: AlldevicesComponent,
    children: [
      { path: 'dashboard', component: DashboardComponent, canActivate: [AuthGuard] },
      { path: 'remediation', component: RemediationComponent, canActivate: [AuthGuard] },
      { path: 'assets', component: AssetsComponent, canActivate: [AuthGuard] },
      { path: 'twodimension', component: Topology2D, canActivate: [AuthGuard] },
      { path: 'threedimension', component: Topology3D, canActivate: [AuthGuard] },
      { path: 'settings', component: SettingComponent, canActivate: [SettingsGuard] },
      { path: 'reports', component: ReportsComponent, canActivate: [AuthGuard] },
      { path: 'view-report', component: ViewReportsComponent, canActivate: [AuthGuard] },
      { path: 'threats', component: ThreatsComponent, canActivate: [AuthGuard] }
    ]
  }
];


@NgModule({
  imports: [RouterModule.forRoot(routes, { useHash: true })],
  exports: [RouterModule],
  providers: []
})
export class AppRoutingModule { }
export const routingComponents = [
  LoginComponent,
  AlldevicesComponent,
  HeaderComponent,
  FooterComponent,
  Topology2D,
  Topology3D,
  DashboardComponent
];
