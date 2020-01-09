import { NgModule, NO_ERRORS_SCHEMA } from "@angular/core";
import { LoginComponent } from "./login/login.component";
import { AuthRoutingModule } from "./auth-routing.module";
import { SignupComponent } from "./signup/signup.component";
import { NativeScriptHttpClientModule } from "nativescript-angular/http-client";
import { NativeScriptFormsModule } from "nativescript-angular/forms";
import { HttpClientModule } from "@angular/common/http";
import { HeaderModule } from "../header/header.module";
import { ToastModule } from "../toast/toast.module";
import { AuthIndexComponent } from "./index/index.component";

@NgModule({
    declarations: [
        LoginComponent,
        SignupComponent,
        AuthIndexComponent,
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
