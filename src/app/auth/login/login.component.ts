import { Component } from "@angular/core";
import { AuthService } from "../auth.service";
import { RouterExtensions } from "nativescript-angular/router";
import { ITnsOAuthTokenResult } from "nativescript-oauth2";
import { Page } from "tns-core-modules/ui/page";

@Component({
    selector: "ns-login",
    templateUrl: "./login.component.html",
    styleUrls: ['./login.component.css']
})
export class LoginComponent {
    email: string = '';
    password: string = '';

    constructor(private page: Page, public authService: AuthService, private routerExtensions: RouterExtensions) {
        page.actionBarHidden = true;
    }

    submit() {
        if(this.password === ""){
            this.routerExtensions.navigate(['/auth/login'], { queryParams: {message: "Please enter a valid password", toastType: "error" },clearHistory: true});
        }

        if(this.email === ""){
            this.routerExtensions.navigate(['/auth/login'], { queryParams: {message: "Please enter a valid email address", toastType: "error" },clearHistory: true});
        }

        if(this.email !== "" && this.password !== ""){
            this.authService.login(this.email, this.password);
        }
    }

    fbOauthLogin(){
        this.authService.getOauthToken("facebook");
    }
}
