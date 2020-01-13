import { Subject } from "rxjs";
import { Injectable } from "@angular/core";
import { Router } from "@angular/router";
import { HttpClient } from "@angular/common/http";
import { confirm } from "tns-core-modules/ui/dialogs";
import { getBoolean, setBoolean, getString, setString, remove} from "tns-core-modules/application-settings";
import { RouterExtensions } from "nativescript-angular/router";
import { TnsOAuthClient, ITnsOAuthTokenResult } from "nativescript-oauth2";

import { AuthData } from './auth-data.model';
import { NotificationService } from "../notification/notification.service";

const BACKEND_URL = 'http://vdrapi-env.d5xyfzxdwi.eu-west-1.elasticbeanstalk.com/api/user/';
// const BACKEND_URL = 'http://192.168.137.2:3000/api/user/';

@Injectable({ providedIn: 'root' })
export class AuthService {
    private token: string;
    private tokenTimer: NodeJS.Timer;
    private userId: string;
    private email: string;
    private fbLinked: boolean;
    private socialUser: boolean;
    private isAuthenticated = false;
    private client: TnsOAuthClient = null;
    private authStatusListener = new Subject<boolean>();

    constructor(private http: HttpClient, private router: Router, private notificationService: NotificationService, private routerExtensions: RouterExtensions){}

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

  getFbLinked(){
      return this.fbLinked;
  }

  getSocialUser(){
      return this.socialUser;
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
    .subscribe(() => {
        console.log("logged out");
        this.isAuthenticated = false;
        this.email = "";
        this.userId = "";
        this.routerExtensions.navigate(['/auth/login'], { queryParams: {message: "Account data removed", toastType: "info" },clearHistory: true});
        this.authStatusListener.next(false);
    });
  }

  changePassword(currentPassword: string, newPassword: string) {
    const data = { currentPassword, newPassword };

    this.http.put<{token: string, userId: string}>(BACKEND_URL + this.userId, data)
        .subscribe(response => {
            const token = response.token;
            this.token = token;
            if (token) {
                this.isAuthenticated = true;
                this.userId = response.userId;
                this.authStatusListener.next(true);
                this.fbLinked = true;
                this.socialUser = false;
                this.saveAuthData(token, this.userId, this.email, this.fbLinked, this.socialUser);
                this.routerExtensions.navigate(['/vehicles'], {queryParams: {message: "Password changed", toastType: "success" }, clearHistory: true});
            }
        }, () => {
            this.routerExtensions.navigate(['/password-reset'], {queryParams: {message: "Error, please re-fill the form", toastType: "error" }, clearHistory: true});
        });
  }

  login(email: string, password: string) {
    const deviceToken = this.notificationService.getToken();
    const authData: AuthData = { email, password, deviceToken};

    this.http.post<{token: string, userId: string, fbLinked: boolean, socialUser: boolean}>(BACKEND_URL + 'login', authData)
        .subscribe(response => {
            const token = response.token;
            this.token = token;
            if (token) {
                this.email = email;
                this.isAuthenticated = true;
                this.userId = response.userId;
                this.fbLinked = response.fbLinked;
                this.socialUser = response.socialUser;
                this.authStatusListener.next(true);
                this.saveAuthData(token, this.userId, email, this.fbLinked, this.socialUser);
                this.routerExtensions.navigate(['/'], {clearHistory: true});
            }
        }, () => {
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
    this.socialUser = authInformation.socialUser;
    this.fbLinked = authInformation.fbLinked;
    this.email = authInformation.email;
    this.authStatusListener.next(true);
  }

  logout() {
    const userId = this.userId;
    const deviceToken = this.notificationService.getToken();
    const logoutData = { userId, deviceToken };

    this.http.post(BACKEND_URL + 'logout', logoutData)
        .subscribe(() => {
            console.log("Removed deviceToken");
        }, () => {
            console.log("Error removing deviceToken");
        });

    this.tnsOauthLogout();

    this.token = null;
    this.isAuthenticated = false;
    this.authStatusListener.next(false);
    this.userId = null;
    clearTimeout(this.tokenTimer);
    this.clearAuthData();

    this.routerExtensions.navigate(['/auth/login'], {clearHistory: true});
  }

  getOauthToken(providerType) {
    let accessToken;
    this.client = new TnsOAuthClient(providerType);
    this.client.loginWithCompletion(
        (tokenResult: ITnsOAuthTokenResult, error) => {
            if(error){
                console.log(error);
            } else {
                accessToken = tokenResult.accessToken;
                this.oAuthSocialLogin(accessToken);
            }
        }
    );
  }

  getOauthUserDetails(accessToken){
    let data = { accessToken };
    return this.http.post<{facebookEmail: string, emailExists: boolean, fbLinked: boolean}>(BACKEND_URL + 'fb-userdata', data);
  }

  oAuthSocialLogin(accessToken){
    let data = { accessToken };
    this.http.post<{facebookEmail: string, emailExists: boolean, fbLinked: boolean, socialUser: boolean}>(BACKEND_URL + 'fb-userdata', data)
        .subscribe(response => {
            if(response.emailExists && response.fbLinked === true){
                console.log("Logging in user with linked FB account");
                this.oAuthLogin(accessToken, response.facebookEmail);
            }
            else if(response.emailExists && response.socialUser === true){
                console.log("Logging in user with social only account");
                this.oAuthLogin(accessToken, response.facebookEmail);
            }
            else if(response.emailExists){
                this.routerExtensions.navigate(['/auth/login'], { queryParams: {message: "Log in and go to settings to link your Facebook", toastType: "info" }, clearHistory: true});
            }
            else{
                console.log("Creating social only account for user");
                this.oAuthLogin(accessToken, response.facebookEmail);
            }
        });
  }

  linkFacebook(){
    let accessToken;
    let email = this.email;
    let facebookEmail;
    let data = { email: email };

    console.log("linking facebook");

    this.client = new TnsOAuthClient("facebook");
    this.client.loginWithCompletion(
        (tokenResult: ITnsOAuthTokenResult, error) => {
            if(error){
                console.log(error);
            } else {
                accessToken = tokenResult.accessToken;
                this.getOauthUserDetails(accessToken).subscribe(response => {
                    facebookEmail = response.facebookEmail;
                    if(response.facebookEmail === email){
                        // VDR & Facebook use same email, connect accounts
                        let data = { email: email };
                        this.http.post(BACKEND_URL + 'fb-link', data).subscribe(() => {
                            this.fbLinked = true;
                            this.socialUser = false;
                            this.saveAuthData(this.getToken(), this.userId, email, this.fbLinked, this.socialUser);
                            this.routerExtensions.navigate(['/'], { queryParams: {message: "Facebook linked", toastType: "success" }, clearHistory: true});
                        });
                    }
                    else {
                        // VDR & Facebook use different emails, switch VDR to use Facebook email
                        let options = {
                            title: "Different email addresses",
                            message: "Your Facebook and Vehicle Reminders emails are different, do you wish VR to switch to your Facebook email?",
                            okButtonText: "Yes",
                            cancelButtonText: "No",
                        };

                        confirm(options).then(result => {
                            if(result){
                                let data = { email: email, facebookEmail: facebookEmail };
                                console.log(data);
                                this.http.post(BACKEND_URL + 'fb-link', data).subscribe(() => {
                                    this.fbLinked = true;
                                    this.socialUser = false;
                                    this.email = facebookEmail;
                                    console.log("new email: "+facebookEmail);
                                    this.saveAuthData(this.getToken(), this.userId, facebookEmail, this.fbLinked, this.socialUser);
                                    this.routerExtensions.navigate(['/'], { queryParams: {message: "Facebook linked", toastType: "success" }, clearHistory: true});
                                }, error => {
                                    this.routerExtensions.navigate(['/'], { queryParams: {message: error.error.message, toastType: "error" },clearHistory: true});
                                });
                            }
                        });
                    }
                }), () => {
                    this.routerExtensions.navigate(['/'], { queryParams: {message: "Error linking Facebook", toastType: "error" },clearHistory: true});
                };
            }
        }
    );
  }

  unlinkFacebook(){
    let email = this.email;
    let data = { email };

    this.http.post(BACKEND_URL + 'fb-unlink', data).subscribe(() => {
        this.fbLinked = false;
        this.socialUser = false;
        this.saveAuthData(this.getToken(), this.userId, email, this.fbLinked, this.socialUser);
        this.routerExtensions.navigate(['/settings'], { queryParams: {message: "Facebook unlinked", toastType: "success" },clearHistory: true});
    });
  }

  oAuthLogin(accessToken, email){
    const deviceToken = this.notificationService.getToken();
    const authData = { email, accessToken, deviceToken };

    this.http.post<{token: string, userId: string, email: string, socialUser: boolean, fbLinked: boolean}>(BACKEND_URL + 'fb-login', authData)
        .subscribe(response => {
            const token = response.token;
            this.token = token;
            if (token) {
                this.email = response.email;
                this.isAuthenticated = true;
                this.userId = response.userId;
                this.authStatusListener.next(true);
                this.fbLinked = response.fbLinked;
                this.socialUser = response.socialUser;
                this.saveAuthData(token, this.userId, response.email, response.fbLinked, response.socialUser);
                this.routerExtensions.navigate(['/'], {clearHistory: true});
            }
        }, () => {
            this.authStatusListener.next(false);
            this.routerExtensions.navigate(['/auth/login'], { queryParams: {message: "Error logging in", toastType: "error" },clearHistory: true});
        });
  }

  tnsOauthLogout() {
    if(this.client){
        this.client.logoutWithCompletion(
            (error) => {
                if(error){
                    console.log("oauth log out failed: "+error);

                } else{
                    console.log("oauth client logged out");
                }
            }
        );
    } else {
        console.log("oauth client logged out");
    }
  }

  private saveAuthData(token: string, userId: string, email: string, fbLinked: boolean, socialUser: boolean) {
    setString("email", email)
    setString('token', token);
    setString('userId', userId);
    setBoolean('fbLinked', fbLinked);
    setBoolean('socialUser', socialUser)
  }

  private clearAuthData() {
    remove('token');
    remove("email");
    remove('userId');
    remove('fbLinked');
    remove('socialUser')
  }

  private getAuthData() {
    const token = getString('token');
    const userId = getString('userId');
    const email = getString("email");
    const fbLinked = getBoolean("fbLinked");
    const socialUser = getBoolean("socialUser");

    if (!token ) {
        return;
    }

    return {
      token,
      userId,
      email,
      fbLinked,
      socialUser
    };
  }
}
