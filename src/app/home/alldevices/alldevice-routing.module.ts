import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';



import { Topology2D } from './topology/2D/topology-2D.component';
import { Topology3D } from './topology/3D/topology-3D.component';
import { DashboardComponent } from './dashboard/dashboard.component';

// import { DatatableComponent } from './datatable/datatable.component';



const allDevicesRoutes: Routes = [
  { path: '', component: DashboardComponent },
  { path: 'dashboard', component: DashboardComponent},
  // { path: 'datatable', component: DatatableComponent },
  { path: 'twodimension', component: Topology2D },
  { path: 'threedimension', component: Topology3D }
];

@NgModule({
  imports: [RouterModule.forChild(allDevicesRoutes)],
  exports: [RouterModule]
})
export class AllDeviceRoutingRoutingModule { }
export const AllDeviceRoutingComponents = [
  
];
