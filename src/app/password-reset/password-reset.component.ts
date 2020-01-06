import { Component, OnInit } from "@angular/core";
import { AuthService } from "../auth/auth.service";
import { Route, ActivatedRoute } from "@angular/router";
import { RouterExtensions } from "nativescript-angular/router";

@Component({
    selector: "ns-password-reset",
    templateUrl: "./password-reset.component.html",
    styleUrls: ["./password-reset.component.css"]
})
export class PasswordResetComponent implements OnInit {
    oldPassword: string = '';
    newPassword: string = '';
    confirmNewPassword: string = "";
    message: string = "";

    constructor(private authService: AuthService, private activatedRoute: ActivatedRoute, private routerExtensions: RouterExtensions) {}

    ngOnInit() {

    }

    submit() {
        if(this.newPassword === this.confirmNewPassword){
            if(this.newPassword === ""){
                this.routerExtensions.navigate(['/password-reset'], { queryParams: {message: "Please enter a valid new password", toastType: "error" },clearHistory: true});
            }
            else{
                this.authService.changePassword(this.oldPassword, this.newPassword);
            }

        }
        else{
            this.routerExtensions.navigate(['/password-reset'], { queryParams: {message: "New passwords don't match", toastType: "error" },clearHistory: true});
        }
    }
}
