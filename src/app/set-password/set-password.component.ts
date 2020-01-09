import { Component, OnInit } from "@angular/core";
import { AuthService } from "../auth/auth.service";
import { Route, ActivatedRoute } from "@angular/router";
import { RouterExtensions } from "nativescript-angular/router";

@Component({
    selector: "ns-set-password",
    templateUrl: "./set-password.component.html",
    styleUrls: ["./set-password.component.css"]
})
export class SetPasswordComponent {
    newPassword: string = '';
    confirmNewPassword: string = "";
    message: string = "";

    constructor(private authService: AuthService, private activatedRoute: ActivatedRoute, private routerExtensions: RouterExtensions) {}

    submit() {
        if(this.newPassword === this.confirmNewPassword){
            if(this.newPassword === ""){
                this.routerExtensions.navigate(['/set-password'], { queryParams: {message: "Please enter a valid new password", toastType: "error" },clearHistory: true});
            }
            else {
                this.authService.changePassword("", this.newPassword);
            }

        }
        else{
            this.routerExtensions.navigate(['/set-password'], { queryParams: {message: "New passwords don't match", toastType: "error" },clearHistory: true});
        }
    }
}
