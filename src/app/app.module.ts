import { NgModule, NO_ERRORS_SCHEMA } from "@angular/core";
import { NativeScriptModule } from "nativescript-angular/nativescript.module";
// import { NativeScriptHttpClientModule } from "nativescript-angular/http-client";

import { NativeScriptFormsModule } from 'nativescript-angular/forms';
import { NativeScriptUIListViewModule  } from 'nativescript-ui-listview/angular';
import { AccordionModule } from "nativescript-accordion/angular";
import { NativeScriptAnimationsModule } from "nativescript-angular/animations"
import { NativeScriptUISideDrawerModule } from "nativescript-ui-sidedrawer/angular";
// import { MAT_DATE_LOCALE } from '@angular/material';
// import { DatePipe } from '@angular/common';

import { AppRoutingModule } from "./app-routing.module";
import { AppComponent } from "./app.component";
import { VehicleListComponent } from "./vehicles/vehicle-list/vehicle-list.component";
import { HeaderComponent } from "./header/header.component";
import { HTTP_INTERCEPTORS } from "@angular/common/http";
import { AuthInterceptor } from "./auth/auth-interceptor";
import { HeaderModule } from "./header/header.module";
import { SidebarComponent } from "./sidebar/sidebar.component";
import { FocusDirective } from "./focus-directive";
import { SettingsComponent } from "./settings/settings.component";
import { PrivacyComponent } from "./privacy/privacy.component";
import { AboutComponent } from "./about/about.component";
import { DatePickerDialog } from "./vehicles/datepicker-dialog/datepicker-dialog";
import { DatePipe } from '@angular/common';
import { NativeScriptHttpClientModule } from "nativescript-angular/http-client";
import { TermsComponent } from "./terms/terms.component";
import { ContactComponent } from "./contact/contact.component";
import { PasswordResetComponent } from "./password-reset/password-reset.component";

@NgModule({
    declarations: [
        AppComponent,
        VehicleListComponent,
        SettingsComponent,
        PrivacyComponent,
        SidebarComponent,
        ContactComponent,
        PasswordResetComponent,
        TermsComponent,
        AboutComponent,
        FocusDirective,
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

        // {provide: MAT_DATE_LOCALE, useValue: 'en-GB'},
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
export class AppModule {

}
