import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, Router } from '@angular/router';
import { Observable } from 'rxjs';
import { RestserviceService } from './services/restservice.service';

@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanActivate {
  constructor(private _RestserviceService: RestserviceService, private _router: Router) {

  }

  canActivate(): boolean {

    if (this._RestserviceService.loggedIn()) {
      return true;
    } else {
      // console.log('You are not authrised to view this page');
      this._router.navigate(['/login']);
      return false;


    }
    // canActivate(
    //   next: ActivatedRouteSnapshot,
    //   state: RouterStateSnapshot): Observable<boolean> | Promise<boolean> | boolean {
    //   return true;
    // }
  }}
