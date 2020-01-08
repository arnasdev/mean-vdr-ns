import { Component } from "@angular/core";
import { AuthService } from "../auth.service";
import { RouterExtensions } from "nativescript-angular/router";

@Component({
    selector: "ns-fb-link",
    templateUrl: "./fb-link.component.html",
    styleUrls: ['./fb-link.component.css']
})
export class FacebookLinkComponent {
    email: string = '';
    password: string = '';

    constructor(public authService: AuthService, private routerExtensions: RouterExtensions) {}

    submit() {

    }

    fbOauthLogin(){
        //this.authService.getOauthToken("facebook");
    }
}
