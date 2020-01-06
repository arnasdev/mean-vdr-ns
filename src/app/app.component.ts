import { Component, OnInit } from "@angular/core";
import { AuthService } from "./auth/auth.service";
import { NotificationService } from "./notification/notification.service";

@Component({
    selector: "ns-app",
    templateUrl: "./app.component.html"
})
export class AppComponent implements OnInit {

    constructor(private authService: AuthService, private notificationsService: NotificationService) {}

    ngOnInit() {
        this.authService.autoAuthUser();
        this.notificationsService.registerNotifications();
    }
}
