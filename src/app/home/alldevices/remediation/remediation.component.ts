import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-remediation',
  templateUrl: './remediation.component.html',
  styleUrls: ['./remediation.component.css']
})
export class RemediationComponent implements OnInit {

  constructor(public router: Router) {
    document.getElementById('dashboard-height-fix').style.height = '100%';
    localStorage.setItem('last_loaded_screen', '/alldevices/remediation');
  }

  ngOnInit() {
  }

  goToDashboard() {
    this.router.navigate(['/alldevices/dashboard']);
  }

  ngOnDestroy() {
    document.getElementById('dashboard-height-fix').style.height = '70%';
  }

}
