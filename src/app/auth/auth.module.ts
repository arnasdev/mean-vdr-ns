import { NgModule, NO_ERRORS_SCHEMA } from "@angular/core";
import { LoginComponent } from "./login/login.component";
import { AuthRoutingModule } from "./auth-routing.module";
import { SignupComponent } from "./signup/signup.component";
import { CommonModule } from "@angular/common";
import { NativeScriptHttpClientModule } from "nativescript-angular/http-client";
import { NativeScriptFormsModule } from "nativescript-angular/forms";
import { HttpClientModule } from "@angular/common/http";
import { HeaderModule } from "../header/header.module";
import { ToastComponent } from "../toast/toast.component";
import { ToastModule } from "../toast/toast.module";
import { FacebookLinkComponent } from "./fb-link/fb-link.component";

@NgModule({
    declarations: [
        LoginComponent,
        SignupComponent,
        FacebookLinkComponent
    ],
    imports: [
        NativeScriptHttpClientModule,
        HttpClientModule,
        AuthRoutingModule,
        NativeScriptFormsModule,
        HeaderModule,
        ToastModule
    ],
    schemas: [
        NO_ERRORS_SCHEMA
    ]
  })
  export class AuthModule {}
