import { NgModule, NO_ERRORS_SCHEMA } from "@angular/core";
import { CommonModule } from "@angular/common";
import { NativeScriptFormsModule } from 'nativescript-angular/forms';
import { ToastComponent } from "../toast/toast.component";

@NgModule({
    declarations: [
        ToastComponent
    ],
    exports: [
        ToastComponent
    ],
    imports: [
        CommonModule,
        NativeScriptFormsModule
    ],
    schemas: [
        NO_ERRORS_SCHEMA
    ]
  })
  export class ToastModule {}
