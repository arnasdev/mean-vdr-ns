import { Subject } from "rxjs";
import { Injectable, DebugElement } from "@angular/core";
import { Router } from "@angular/router";
import { HttpClient, HttpHeaders } from "@angular/common/http";
import { request } from 'http';

import { environment } from "~/environments/environment";

import { AuthData } from './auth-data.model';
import { NsHttpBackEnd } from "nativescript-angular/http-client";
import { HttpService } from "../http.service";

import {
    getBoolean,
    setBoolean,
    getNumber,
    setNumber,
    getString,
    setString,
    hasKey,
    remove,
    clear
} from "tns-core-modules/application-settings";
import { NotificationService } from "../notification/notification.service";
import { RouterExtensions } from "nativescript-angular/router";
import { TnsOAuthClient, ITnsOAuthTokenResult } from "nativescript-oauth2";
import { response } from "express";

const BACKEND_URL = 'http://vdrapi-env.d5xyfzxdwi.eu-west-1.elasticbeanstalk.com/api/user/';
// const BACKEND_URL = 'http://192.168.137.2:3000/api/user/';
let headers = new HttpHeaders(
{
    'Content-Type': 'application/x-www-form-urlencoded'
});

@Injectable({ providedIn: 'root' })
export class AuthService {
    private token: string;
    private tokenTimer: NodeJS.Timer;
    private userId: string;
    private email: string;

    private isAuthenticated = false;
    private client: TnsOAuthClient = null;
    private authStatusListener = new Subject<boolean>();

    constructor(private http: HttpClient, private router: Router, private notificationService: NotificationService, private routerExtensions: RouterExtensions,){}


  getToken() {
    return this.token;
  }

  getIsAuth() {
    return this.isAuthenticated;
  }

  getUserId() {
    return this.userId;
  }

  getAuthStatusListener() {
    return this.authStatusListener.asObservable();
  }

  getEmail(){
      return this.email;
  }

  createUser(email: string, password: string){
    const deviceToken = this.notificationService.getToken();
    const authData: AuthData = {email, password, deviceToken};
    this.http
    .post(BACKEND_URL + 'signup', authData)
    .subscribe(() => {
      this.router.navigate(['/']);
    }, error => {
        console.log(error);
        this.routerExtensions.navigate(['/auth/signup'], { queryParams: {message: error.error.message, toastType: "error" },clearHistory: true});
        this.authStatusListener.next(false);
    });
  }

  deleteUser(){
    this.http.delete(BACKEND_URL + this.userId)
    .subscribe((result) => {
        console.log("logged out");
        this.isAuthenticated = false;
        this.email = "";
        this.userId = "";
        this.routerExtensions.navigate(['/auth/login'], { queryParams: {message: "Account data removed", toastType: "info" },clearHistory: true});
        this.authStatusListener.next(false);
    })
  }

  changePassword(currentPassword: string, newPassword: string) {
    const data = { currentPassword, newPassword };

    this.http.put<{token: string, userId: string}>(BACKEND_URL + this.userId, data)
        .subscribe(response => {
            console.log(response);
            const token = response.token;
            this.token = token;
            if (token) {
                this.isAuthenticated = true;
                this.userId = response.userId;
                this.authStatusListener.next(true);
                this.saveAuthData(token, this.userId, this.email);
                this.routerExtensions.navigate(['/vehicles'], {queryParams: {message: "Password changed", toastType: "success" }, clearHistory: true});
            }
        }, error => {
            this.routerExtensions.navigate(['/password-reset'], {queryParams: {message: "Error, please re-fill the form", toastType: "error" }, clearHistory: true});

        });
  }

  login(email: string, password: string) {
    const deviceToken = this.notificationService.getToken();
    const authData: AuthData = { email, password, deviceToken};

    this.http.post<{token: string, userId: string}>(BACKEND_URL + 'login', authData)
        .subscribe(response => {
            const token = response.token;
            this.token = token;
            if (token) {
                this.email = email;
                this.isAuthenticated = true;
                this.userId = response.userId;
                this.authStatusListener.next(true);
                this.saveAuthData(token, this.userId, email);
                this.routerExtensions.navigate(['/'], {clearHistory: true});
            }
        }, error => {
            this.authStatusListener.next(false);
            this.routerExtensions.navigate(['/auth/login'], { queryParams: {message: "Error logging in", toastType: "error" },clearHistory: true});
        });
  }

  autoAuthUser() {

    const authInformation = this.getAuthData();
    if (!authInformation) {
      return;
    }

    this.token = authInformation.token;
    this.isAuthenticated = true;
    this.userId = authInformation.userId;
    this.email = authInformation.email;
    this.authStatusListener.next(true);
  }

  logout() {
    const userId = this.userId;
    const deviceToken = this.notificationService.getToken();
    const logoutData = { userId, deviceToken };

    this.http.post(BACKEND_URL + 'logout', logoutData)
    .subscribe(response => {
        console.log("Removed deviceToken");
    }, error => {
        console.log("Error removing deviceToken");
    });

    console.log("logged out");
    this.token = null;
    this.isAuthenticated = false;
    this.authStatusListener.next(false);
    this.userId = null;
    clearTimeout(this.tokenTimer);
    this.clearAuthData();

    this.routerExtensions.navigate(['/auth/login'], {clearHistory: true});
  }

  tnsOauthLogin(providerType) {
      console.log("logging in");
    this.client = new TnsOAuthClient(providerType);
    console.log(providerType);

    // return new Promise<ITnsOAuthTokenResult>((resolve, reject) => {
        this.client.loginWithCompletion(
            (tokenResult: ITnsOAuthTokenResult, error) => {
                if(error){
                    console.log(error);
                } else {
                    console.log(tokenResult);
                }
            }
        );
    //});
  }

  tnsOauthLogout(): Promise<any> {
    return new Promise<any>((resolve, reject) => {
        if(this.client){
            this.client.logoutWithCompletion(
                (error) => {
                    if(error){
                        console.log("back to main page with error");
                        console.log(error);
                        reject(error);
                    } else{
                        console.log("back to main page with success");
                        resolve();
                    }
                }
            );
        } else {
            console.log("back to main page with success");
            resolve();
        }
    });
  }

  private saveAuthData(token: string, userId: string, email: string) {
    setString("email", email)
    setString('token', token);
    setString('userId', userId);
  }

  private clearAuthData() {
    remove('token');
    remove("email");
    remove('userId');
  }

  private getAuthData() {
    const token = getString('token');
    const userId = getString('userId');
    const email = getString("email");

    if (!token ) {
        return;
    }

    return {
      token,
      userId,
      email
    };
  }
}
