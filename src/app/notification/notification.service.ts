import { Injectable, OnInit } from "@angular/core";
import { messaging, Message } from "nativescript-plugin-firebase/messaging";
import { HttpClient } from "@angular/common/http";
import { Router } from "@angular/router";
import { alert } from "tns-core-modules/ui/dialogs";
import { setString, remove, getString } from "tns-core-modules/application-settings/application-settings";
import { Subject } from "rxjs";
import { AuthService } from "../auth/auth.service";
import { RouterExtensions } from "nativescript-angular/router";

const BACKEND_URL = 'http://vdrapi-env.d5xyfzxdwi.eu-west-1.elasticbeanstalk.com/api/notification/';
//const BACKEND_URL = 'http://192.168.137.2:3000/api/notification/';

@Injectable({ providedIn: 'root' })
export class NotificationService {

    constructor(private http: HttpClient, private router: Router, private routerExtensions: RouterExtensions){ }

    private deviceToken: string = "";
    private notificationsEnabled: boolean;
    private notificationsListener = new Subject<boolean>();



    getNotificationsListener(){
        return this.notificationsListener;
    }

    getNotificationsEnabled(){
        return this.notificationsEnabled;
    }

    getToken(){
        return this.deviceToken;
    }

    registerNotifications() {
        messaging.registerForPushNotifications({
            onPushTokenReceivedCallback: (token: string): void => {
                // this.saveDeviceToken(token);
                this.deviceToken = token;
                console.log("Firebase plugin received a push token: " + token);
            },

            onMessageReceivedCallback: (message: Message) => {
                console.log("Push message received: " + message.title);
                if(message.foreground){
                    let options = {
                        title: message.title,
                        message: message.body,
                        okButtonText: "OK"
                    };
                    alert(options).then(() => {
                    });
                }
            },

            // Whether you want this plugin to automatically display the notifications or just notify the callback. Currently used on iOS only. Default true.
            showNotifications: true,

            // Whether you want this plugin to always handle the notifications when the app is in foreground. Currently used on iOS only. Default false.
            showNotificationsWhenInForeground: true
        })
        .then(() => {
            console.log("Firebase Initialized");
        }

        )
        .catch(error => {
            console.log("Firebase Initialization Error "+ error);
        });
    }

    private saveDeviceToken(token: string) {
        setString('deviceToken', token);

      }

      private clearDeviceToken() {
        remove('deviceToken');

      }

      private getDeviceToken() {
        const token = getString('deviceToken');
        return token;
      }

      editNotification(notification: boolean) {
        let string = "enabled";

        let data = {
            notification: notification
        }

        if(!notification){
            string = "disabled";
        }

        console.log("sending put");

        this.getNotification();
        if(notification === this.notificationsEnabled){
            return;
        }

        this.http.put(BACKEND_URL, data).subscribe((result) => {
            this.notificationsEnabled = notification;
            this.notificationsListener.next(this.notificationsEnabled);

            this.routerExtensions.navigate(['/settings'], {queryParams: {message: "Notifications "+string, toastType: "info" }, clearHistory: true});
        });
      }

    getNotification() {
        this.http.get<{message: string, notification: boolean}>(BACKEND_URL).subscribe((result) => {
            this.notificationsEnabled = result.notification;
            this.notificationsListener.next(this.notificationsEnabled);
        });
    }
}
