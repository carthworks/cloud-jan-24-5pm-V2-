
import { IntercommunicationService } from 'src/app/services/intercommunication.service';
import { Router } from '@angular/router';
import { SocketdataService } from 'src/app/services/socketdata.service';
import { Component, OnInit, HostListener } from '@angular/core';
import { Subscription } from 'rxjs';
import { ToastrService } from 'ngx-toastr';
import { SelectItem } from 'primeng/api';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.css']
})
export class HeaderComponent implements OnInit {

  array: any[] = [];
  collecters: SelectItem[] = [];
  selectedCustomer: any;
  customer_id: any;
  logoutConnection: Subscription = null;

  selectedCollector: any;
  customerSelectBool: boolean = false;
  collectorSelectBool: boolean = false;
  isCustomer: boolean = false;
  isSettingsIconEnabled: boolean = true;
  constructor(
    private socketdataservice: SocketdataService,
    public router: Router,
    private intercommunicationService: IntercommunicationService,
    private toastr: ToastrService
  ) { }

  ngOnInit() {
    this.customer_id = parseInt(localStorage.getItem('setting_customer_id'));
    var parameter = { token: localStorage.getItem('token'), customer_id: this.customer_id };
    this.socketdataservice.setCustomerList(parameter);
    this.socketdataservice.getCustomerList().subscribe((info: any) => {
      this.array = [];
      info.map(customer => {
        var cust = {};
        cust['id'] = customer['customer_id'];
        cust['license'] = customer['license'];
        cust['name'] = this.capitalizeFirstLetter(customer["customer_name"]);
        // localStorage.setItem('cust', btoa(JSON.stringify(cust)));
        // this.array.push(JSON.parse(atob(localStorage.getItem('cust'))));
        this.array.push(cust);
      });

      this.isCustomer = localStorage.getItem('setting_customer_id') != '0';

      if (localStorage.getItem('customer_name') == 'Ai3') {
        localStorage.setItem('customer_id', this.array[0].id);
        this.prepareCollecterOptions(this.array[0]);
      } else {
        this.selectedCustomer = this.array.find(
          x => x.name.toLowerCase() === localStorage.getItem('customer_name').toLowerCase()
        );
        this.prepareCollecterOptions(this.selectedCustomer);
      }

      localStorage.setItem('customer_details', btoa(JSON.stringify(this.array)));
    });

    this.logoutConnection = this.intercommunicationService.sendTokenExpired().subscribe(info => {
      this.logoutConnection.unsubscribe();
      this.toastr.info('Session expired');
      this.Logout();
    });

    if (localStorage.getItem('ROLE') == '3') {
      this.isSettingsIconEnabled = false;
    }
  }

  public onCustomerDropdownClick(e) {
    if (e.originalEvent.type == 'click') {
      localStorage.setItem('customer_id', e.value.id);
      localStorage.setItem('customer_id_host', e.value.id);
      localStorage.setItem('customer_name', e.value.name);

      this.prepareCollecterOptions(e.value)

      this.intercommunicationService.headerdropdownClicked(true);
    }
  }

  onCustomerKeyUp(event) {
    if (event.keyCode == 40 || event.keyCode == 38 || ((event.keyCode >= 65) && (event.keyCode <= 90))) {
      if (parseInt(localStorage.getItem('customer_id')) != parseInt(this.selectedCustomer.id)) {
        localStorage.setItem('customer_id', this.selectedCustomer.id);
        localStorage.setItem('customer_id_host', this.selectedCustomer.id);
        localStorage.setItem('customer_name', this.selectedCustomer.name);

        this.prepareCollecterOptions(this.selectedCustomer)

        this.intercommunicationService.headerdropdownClicked(true);
      }
    }
  }

  prepareCollecterOptions(user) {
    this.collecters = [{ label: "All", value: "all" }];
    for (var key in user['license']) {
      if (user['license'].hasOwnProperty(key)) {
        this.collecters.push({ label: user['license'][key], value: key });
      }
    }
    this.selectedCollector = this.collecters[0]['value'];
    localStorage.setItem('selected_collecter', this.selectedCollector);
  }

  onCollectorDropdownClick(e) {
    if (e.originalEvent.type == 'click') {
      localStorage.setItem('selected_collecter', e.value);
      this.intercommunicationService.headerdropdownClicked(true);
    }
  }

  onCollectorKeyUp(event) {
    if (event.keyCode == 40 || event.keyCode == 38 || ((event.keyCode >= 65) && (event.keyCode <= 90))) {
      if (`${localStorage.getItem('selected_collecter')}` != `${this.selectedCollector}`) {
        localStorage.setItem('selected_collecter', this.selectedCollector);
        this.intercommunicationService.headerdropdownClicked(true);
      }
    }
  }

  /**
 * capitalizeFirstLetter
 */

  public capitalizeFirstLetter(string) {
    return string.charAt(0).toUpperCase() + string.slice(1);
  }

  /* new header options 12.12.2019 */

  visibleSidebar_popup: boolean;
  visibleSidebar() {
    this.visibleSidebar_popup = true;
  }

  Home(name) {
    this.visibleSidebar_popup = false;
    this.router.navigate(['/alldevices/dashboard']);
  }

  Threats(name) {
    this.visibleSidebar_popup = false;
    this.router.navigate(['/alldevices/threats']);
  }

  Assets(name) {
    this.visibleSidebar_popup = false;
    this.router.navigate(['/alldevices/assets']);
  }

  Reports(name) {
    this.visibleSidebar_popup = false;
    this.router.navigate(['/alldevices/reports']);
  }

  Remediation(name) {
    this.visibleSidebar_popup = false;
    this.router.navigate(['/alldevices/remediation']);
  }

  Setting() {
    this.visibleSidebar_popup = false;
    this.router.navigate(['/alldevices/settings']);
  }

  Logout() {
    this.visibleSidebar_popup = false;
    window.location.href = '/';
    localStorage.clear();
  }
}
