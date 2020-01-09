import { NgModule, NO_ERRORS_SCHEMA } from "@angular/core";
import { NativeScriptModule } from "nativescript-angular/nativescript.module";
import { NativeScriptFormsModule } from 'nativescript-angular/forms';
import { NativeScriptUIListViewModule  } from 'nativescript-ui-listview/angular';
import { NativeScriptAnimationsModule } from "nativescript-angular/animations"
import { NativeScriptUISideDrawerModule } from "nativescript-ui-sidedrawer/angular";
import { DatePipe } from '@angular/common';
import { NativeScriptHttpClientModule } from "nativescript-angular/http-client";
import { HTTP_INTERCEPTORS } from "@angular/common/http";

import { AppRoutingModule } from "./app-routing.module";
import { AppComponent } from "./app.component";
import { VehicleListComponent } from "./vehicles/vehicle-list/vehicle-list.component";
import { AuthInterceptor } from "./auth/auth-interceptor";
import { HeaderModule } from "./header/header.module";
import { SettingsComponent } from "./settings/settings.component";
import { PrivacyComponent } from "./privacy/privacy.component";
import { AboutComponent } from "./about/about.component";
import { DatePickerDialog } from "./vehicles/datepicker-dialog/datepicker-dialog";
import { TermsComponent } from "./terms/terms.component";
import { ContactComponent } from "./contact/contact.component";
import { PasswordResetComponent } from "./password-reset/password-reset.component";
import { SetPasswordComponent } from "./set-password/set-password.component";

@NgModule({
    declarations: [
        AppComponent,
        VehicleListComponent,
        SettingsComponent,
        PrivacyComponent,
        ContactComponent,
        PasswordResetComponent,
        SetPasswordComponent,
        TermsComponent,
        AboutComponent,
        DatePickerDialog
    ],
    imports: [
        NativeScriptModule,
        NativeScriptFormsModule,
        AppRoutingModule,
        NativeScriptHttpClientModule,
        NativeScriptUIListViewModule,
        NativeScriptAnimationsModule,
        NativeScriptUISideDrawerModule,
        HeaderModule
    ],
    providers: [
        { provide: HTTP_INTERCEPTORS, useClass: AuthInterceptor, multi: true },
        DatePipe
    ],
    schemas: [
        NO_ERRORS_SCHEMA
    ],
    bootstrap: [
        AppComponent
    ],
    entryComponents: [
        DatePickerDialog
    ]
})
/*
Pass your application module to the bootstrapModule function located in main.ts to start your app
*/
export class AppModule {}
