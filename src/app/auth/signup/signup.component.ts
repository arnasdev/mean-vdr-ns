import { Component } from "@angular/core";
import { RouterExtensions } from "nativescript-angular/router";

import { AuthService } from "../auth.service";

@Component({
    selector: "ns-signup",
    templateUrl: "./signup.component.html",
    styleUrls: ['./signup.component.css']
})
export class SignupComponent {
    email: string = "";
    password: string = "";

    constructor(public authService: AuthService, private routerExtensions: RouterExtensions) {}


    submit() {
        if(this.password === ""){
            this.routerExtensions.navigate(['/auth/signup'], { queryParams: {message: "Please enter a valid password", toastType: "error" },clearHistory: true});
        }

        if(this.email === ""){
            this.routerExtensions.navigate(['/auth/signup'], { queryParams: {message: "Please enter a valid email address", toastType: "error" },clearHistory: true});
        }

        if(this.email !== "" && this.password !== ""){
            this.authService.createUser(this.email, this.password);
        }
    }

    fbOauthLogin(){
        this.authService.getOauthToken("facebook");
    }
}
