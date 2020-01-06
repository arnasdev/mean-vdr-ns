import { NgModule, NO_ERRORS_SCHEMA } from "@angular/core";
import { HeaderComponent } from "../header/header.component";
import { CommonModule } from "@angular/common";
import { NativeScriptFormsModule } from 'nativescript-angular/forms';
import { ToastModule } from "../toast/toast.module";

@NgModule({
    declarations: [
        HeaderComponent
    ],
    exports: [
        HeaderComponent
    ],
    imports: [
        CommonModule,
        ToastModule,
        NativeScriptFormsModule
    ],
    schemas: [
        NO_ERRORS_SCHEMA
    ]
  })
  export class HeaderModule {



  }
