import { Component, OnInit } from "@angular/core";
import { trigger, state, transition, animate, style } from "@angular/animations";
import { Subscription } from "rxjs";
import { SidebarService } from "./sidebar.service";
import { AuthService } from "../auth/auth.service";
import { Router } from "@angular/router";
import {
    confirm
} from "tns-core-modules/ui/dialogs";

@Component({
    selector: "ns-sidebar",
    templateUrl: "./sidebar.component.html",
    styleUrls: ["./sidebar.component.css"],
    animations: [
        trigger('state', [
            state("inactive", style({"width": "0px"})),
            state("active", style({"width":"100%"})),
            transition("inactive => active", [animate("100ms ease-out")]),
            transition("active => inactive", [animate("100ms ease-out")])
        ])
    ],
})
export class SidebarComponent implements OnInit {
    sidebarSubscription: Subscription;
    sidebar: any;


    vehiclePath = '/';
    settingsPath = '/settings';
    privacyPath = '/privacy';
    aboutPath = '/about';

    constructor(private sidebarService: SidebarService, private authService: AuthService, public router: Router){}

    ngOnInit() {
        this.sidebarSubscription = this.sidebarService
        .getSidebarUpdateListener()
        .subscribe((sidebarData => {
            this.toggleSideBar(sidebarData.visible)
        }));
    }

    ngOnDestroy() {
        this.sidebarSubscription.unsubscribe();
    }


    loadPage(path: string){
        if(path ===  this.router.url){
            this.sidebarService.closeSideBar();
        }
        else{
            this.router.navigate([path]);
        }
    }

    registerSidebar(sidebar){
        this.sidebar = sidebar;
    }

    blockEvents() {

    }

    toggleSideBar(visible: boolean) {
        if(visible === undefined) {
            this.toggleState(this.sidebar);
        }
        else{
            this.changeState(this.sidebar, visible);
        }

    }

    toggleState(obj) {
        let state = obj.state;
        state = state === 'active' ? 'inactive' : 'active';
        obj.state = state;
    }

    changeState(obj, visible: boolean) {
        let state = obj.state;
        if(visible){
            state = "active";
        }
        else {
            state = "inactive";
        }

        obj.state = state;
    }

    logout() {
        let options = {
            title: "Logout?",
            okButtonText: "Yes",
            cancelButtonText: "No",
        };

        confirm(options).then(result => {
            if(result){
                this.authService.logout();
            }
        });


    }
 }
