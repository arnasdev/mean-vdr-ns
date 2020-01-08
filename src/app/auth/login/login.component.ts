import { Component } from "@angular/core";
import { AuthService } from "../auth.service";
import { RouterExtensions } from "nativescript-angular/router";
import { Page } from "tns-core-modules/ui/page";

@Component({
    selector: "ns-login",
    templateUrl: "./login.component.html",
    styleUrls: ['./login.component.css']
})
export class LoginComponent {
    email: string = '';
    password: string = '';

    constructor(public authService: AuthService, private routerExtensions: RouterExtensions) {}

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
