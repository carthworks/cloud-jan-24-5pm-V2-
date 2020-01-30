import { Component, OnInit } from '@angular/core';
import { Router, NavigationEnd } from '@angular/router';

@Component({
  selector: 'app-verify-mask',
  templateUrl: './verify-mask.component.html',
  styleUrls: ['./verify-mask.component.css']
})
export class VerifyMaskComponent implements OnInit {

  isVerify: boolean = false;
  constructor(private router: Router) { }

  ngOnInit() {
    this.router.events.subscribe((val) => {
      if (val instanceof NavigationEnd) {
        this.isVerify = val.url == '/verify' ? true : false;
      }
    });
  }

}
