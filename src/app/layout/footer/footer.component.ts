import { Component, OnInit, OnDestroy, HostListener } from '@angular/core';
import { RestserviceService } from '../../services/restservice.service';
import { IntercommunicationService } from '../../services/intercommunication.service';
// import { AppRegistry } from '../../services/AppRegistry.service';
import { ToastrService } from 'ngx-toastr';
import { SocketdataService } from '../../services/socketdata.service';


@Component({
  selector: 'app-footer',
  templateUrl: './footer.component.html',
  styleUrls: ['./footer.component.css']
})
export class FooterComponent implements OnInit, OnDestroy {
  today: number = Date.now();
  consoleversion = '';
  showAdminSettingsScreen: boolean;
  appRegister;
  settingsOff;
  isOn: boolean = true;
  logoutConnection = null;
  loggedInUser: string;
  RowClickedStateInAlldevice: any;
  crowdPopupAppeared: boolean;
  enableGear: any;
  isSettingsIconEnabled: boolean = true;
  constructor(private restService: RestserviceService, private ic: IntercommunicationService, 
    private toastr: ToastrService, private socketdataservice: SocketdataService) { }

  ngOnInit() {

    if(localStorage.getItem('ROLE') == '3'){
      this.isSettingsIconEnabled = false;
    }

    if (localStorage.getItem('version')) {
      this.consoleversion = localStorage.getItem('version');
    } else {
      this.consoleversion = '2.0.0';
    }


    this.loggedInUser = localStorage.getItem('customer_name');
    this.logoutConnection = this.ic.sendTokenExpired().subscribe(info => {
      this.toastr.info('Session expired', '');
      this.logout();
    });

    this.enableGear = this.ic.disableSettingsGear().subscribe(status => {
     this.crowdPopupAppeared = !status;

    });

  }

  SettingsClicked() {
   // console.log('SettingsClicked : true');
    this.ic.settingClicked(true);
    this.ic.setNavigationClickEvent("settings");
  }

  ngOnDestroy() {

    this.logoutConnection.unsubscribe();
    this.enableGear.unsubsccribe();
  }

  public logout() {
    this.restService.logout()
      .then((user) => {
        // this.toastr.info('Successfully logged out of Akitra console!');
        localStorage.clear();
      })
      .catch((err) => {
      //  console.log('Error Msg ', err.error['ERROR']);
      });

    if (!localStorage.getItem('loginTime')) {
      localStorage.setItem('loginTime', String(new Date().getTime() / 1000));
    }
    localStorage.clear();
    window.location.href = '/';
  }

}
