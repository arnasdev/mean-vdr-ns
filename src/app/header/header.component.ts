import { Component, OnInit, Input } from "@angular/core";
import { topmost } from "tns-core-modules/ui/frame/frame";
import { Router } from "@angular/router";
import { confirm } from "tns-core-modules/ui/dialogs";
import { RouterExtensions } from "nativescript-angular/router";

import { AuthService } from "../auth/auth.service";
import { VehiclesService } from "../vehicles/vehicles.service";

@Component({
    selector: "ns-header",
    templateUrl: "./header.component.html",
    styleUrls: ["./header.component.css"]
})
export class HeaderComponent implements OnInit {

    vehiclePath = '/vehicles';
    settingsPath = '/settings';
    privacyPath = '/privacy';
    aboutPath = '/about';

    constructor(public router: Router, private vehiclesService: VehiclesService, private authService: AuthService, private routerExtensions: RouterExtensions){}

    @Input() public title: string;
    public registration: string = '';

    ngOnInit() {
        const rootFrame = topmost();
        rootFrame.actionBarVisibility ='never';
    }

    searchRegistration() {
        console.log(this.registration);
        this.vehiclesService.searchRegistration(this.registration);
        this.registration = "";
    }

    loadPage(path: string){
        if(path ===  this.router.url){
        }
        else{
            this.routerExtensions.navigate([path], {queryParams: { }});
        }
    }

    logout() {
        let options = {
            title: "Logout?",
            message: "You will be logged out and stop recieving notifications.",
            okButtonText: "Yes",
            cancelButtonText: "No",
        };

        confirm(options).then(result => {
            if(result){
                this.authService.logout();
            }
        });
    }

    isActive(path: string) {
        if(this.router.url.includes(path)){
            return "active";
        }
    }
 }
