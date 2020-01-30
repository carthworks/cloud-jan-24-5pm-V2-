import { Injectable } from "@angular/core";
import { Http } from "@angular/http";
import { HttpClient, HttpHeaders } from "@angular/common/http";
import "rxjs/add/operator/map";
import "rxjs/add/operator/catch";
import "rxjs/add/observable/throw";
import { Observable } from "rxjs";
import "rxjs/add/operator/toPromise";

@Injectable()
export class RestserviceService {
  constructor(public http: HttpClient) {}
  user = {
    username: "",
    password: ""
  };
  httpOptions = {
    headers: new HttpHeaders({ "Content-Type": "application/json" })
  };

  httpOptions1 = {
    headers: new HttpHeaders({
      "Content-Type": "application/json",
      "x-access-token": localStorage.getItem("token")
    })
  };

  login(request): Promise<any> {
    let body = JSON.stringify(request);
    return this.http
      .post(
        window.location.origin + "/ms/auth/login/v1",
        body,
        this.httpOptions
      )
      .toPromise();
  }

  logout() {
    this.httpOptions.headers.append("", localStorage.getItem("token"));
    return this.http
      .get(window.location.origin + "/ms/auth/logout/v1", this.httpOptions)
      .toPromise();
  }

  register(request) {
    let body = JSON.stringify(request);
    return this.http
      .post(
        window.location.origin + "/ms/registration/v1",
        body,
        this.httpOptions
      )
      .toPromise();
  }

  add_customer(request) {
    let body = JSON.stringify(request);
    return this.http
      .post(
        window.location.origin + "/ms/registration/v1",
        body,
        this.httpOptions
      )
      .toPromise();
  }

  add_customer1(request) {
    let body = JSON.stringify(request); // /registration/v1
    return this.http
      .post(
        "https://13.59.47.249:3000" + "/customer/registeruser",
        body,
        this.httpOptions
      )
      .toPromise();
  }

  device_type() {
    this.httpOptions.headers.append("", localStorage.getItem("token"));
    return this.http
      .get(
        "https://e23h8i2yv0.execute-api.us-east-2.amazonaws.com/beta",
        this.httpOptions
      )
      .toPromise();
  }

  loggedIn() {
    return !!localStorage.getItem("token");
  }

  reset(value) {
    return this.http.get(value, this.httpOptions).toPromise();
  }
}
