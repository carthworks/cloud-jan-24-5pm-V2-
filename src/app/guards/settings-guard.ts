
import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, Router } from '@angular/router';
import { Observable } from 'rxjs';
import { RestserviceService } from '../services/restservice.service';

@Injectable({
  providedIn: 'root'
})
export class SettingsGuard implements CanActivate {
  constructor(private _RestserviceService: RestserviceService, private _router: Router) { }

  canActivate(): boolean {
    if (localStorage.getItem('ROLE') != '3' && this._RestserviceService.loggedIn()) {
      return true;
    } else {
      return false;
    }
  }
}
