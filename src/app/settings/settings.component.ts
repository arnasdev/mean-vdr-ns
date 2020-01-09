import { Component, OnInit, OnDestroy } from "@angular/core";
import { Subscription } from "rxjs";
import { AuthService } from "../auth/auth.service";
import { confirm, alert, prompt, PromptOptions, inputType, capitalizationType, PromptResult } from "tns-core-modules/ui/dialogs";
import { NotificationService } from "../notification/notification.service";
import { Router } from "@angular/router";


@Component({
    selector: "ns-settings",
    templateUrl: "./settings.component.html",
    styleUrls: ["./settings.component.css"]
})
export class SettingsComponent implements OnInit, OnDestroy{

    authSubscription: Subscription;
    notificationSubscription: Subscription;

    isAuthenticated;

    switchStatus: boolean = true;

    termsPath = '/terms';
    contactPath = '/contact';
    privacyPath = '/privacy';
    aboutPath = '/about';
    fbLinkPath = "/auth/fb-link";


    constructor(private authService: AuthService, private notificationService: NotificationService, private router: Router) {}

    ngOnInit() {
        this.notificationService.getNotification();

        setTimeout(() => {
            this.switchStatus = this.notificationService.getNotificationsEnabled();
        }, 1000);

        this.authSubscription = this.authService
          .getAuthStatusListener()
          .subscribe(authStatus => {
            this.isAuthenticated = authStatus;
        });

        this.notificationSubscription = this.notificationService
            .getNotificationsListener()
            .subscribe(notifications => {
            this.switchStatus = notifications;
        });
    }

    getFbLinked(){
        return this.authService.getFbLinked();
    }

    getSocialUser(){
        return this.authService.getSocialUser();
    }

    ngOnDestroy() {
        this.authSubscription.unsubscribe();
        this.notificationSubscription.unsubscribe();
    }

    getEmail(){
        return this.authService.getEmail();
    }

    changePassword(){
        this.router.navigate(["password-reset"]);
    }


    deleteUser(){
        let options = {
            title: "Really delete your account?",
            message: "Your account will be deleted and you will stop recieving notifications. These changes are irreversible.",
            okButtonText: "Yes",
            cancelButtonText: "No",
        };

        confirm(options).then(result => {
            if(result){
                this.authService.deleteUser();
            }
        });
    }

    getNotifications(){
        this.notificationService.getNotification();
    }

    toggleNotification(status){
        status = !status;

        if(status === this.notificationService.getNotificationsEnabled()){
            return;
        }

        this.notificationService.editNotification(status);
    }

    setPassword(){
        this.router.navigate(["set-password"]);
    }

    linkFacebook(){
        this.authService.linkFacebook();
    }

    unlinkFacebook(){
        let options = {
            title: "Are you sure you want to unlink Facebook?",
            message: "Your Facebook will be unlinked and you'll have to sign in using your password! Your account will NOT be deleted.",
            okButtonText: "Yes",
            cancelButtonText: "No",
        };

        confirm(options).then(result => {
            if(result){
                this.authService.unlinkFacebook();
            }
        });
    }

    loadPage(path: string){
        if(path ===  this.router.url){

        }
        else{
            this.router.navigate([path]);
        }
    }
}
