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

    ngOnDestroy() {
        this.authSubscription.unsubscribe();
        this.notificationSubscription.unsubscribe();
    }


    getEmail(){
        return this.authService.getEmail();
    }

    changePassword(){

        this.router.navigate(["password-reset"]);
        // let options: PromptOptions = {
        //     title: "Change Password Form",
        //     defaultText: "Enter your existing password",
        //     message: "",
        //     okButtonText: "OK",
        //     cancelButtonText: "Cancel",
        //     cancelable: true,
        //     inputType: inputType.text, // email, number, text, password, or email
        //     capitalizationType: capitalizationType.sentences // all. none, sentences or words
        // };

        // let oldPassword;
        // let newPassword;
        // let newPasswordConfirm;

        // prompt(options).then((result: PromptResult) => {
        //     oldPassword = result.text;
        //     options.defaultText = "Enter your new password";

        //     prompt(options).then((result: PromptResult) => {
        //         newPassword = result.text;
        //         options.defaultText = "Re-enter your new password";

        //         prompt(options).then((result: PromptResult) => {
        //             newPasswordConfirm = result.text;

        //         });
        //     });
        // });
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

    loadPage(path: string){
        if(path ===  this.router.url){

        }
        else{
            this.router.navigate([path]);
        }
    }
}
