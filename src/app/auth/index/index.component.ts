import { Component } from "@angular/core";
import { AuthService } from "../auth.service";
import { RouterExtensions } from "nativescript-angular/router";
import { Page } from "tns-core-modules/ui/page";

@Component({
    selector: "ns-auth-index",
    templateUrl: "./index.component.html",
    styleUrls: ['./index.component.css']
})
export class AuthIndexComponent {
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
