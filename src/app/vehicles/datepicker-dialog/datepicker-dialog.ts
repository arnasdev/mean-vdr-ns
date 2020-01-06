import { Component, OnInit, ElementRef, ViewChild } from "@angular/core";
import { ModalDialogParams } from "nativescript-angular/modal-dialog";

import { DatePicker } from "tns-core-modules/ui/date-picker";
import { Page } from "tns-core-modules/ui/page";
import { View } from "tns-core-modules/ui/core/view";
import { Label } from "tns-core-modules/ui/label";
import { DialogOptions } from "tns-core-modules/ui/dialogs";
import { AfterViewInit} from '@angular/core';

@Component({
    selector: "modal-content",
    template: `
    <StackLayout margin="24" horizontalAlignment="center">
        <Label horizontalAlignment="center" class ="h2" text="{{this.prompt}}"></Label>
        <DatePicker #datePickerID verticalAlignment="center"  ></DatePicker>

        <StackLayout orientation="horizontal" marginTop="12" horizontalAlignment="center">
            <Button text="ok" (tap)="close('Ok')"></Button>
            <Button text="cancel" (tap)="close('Cancel')"></Button>
        </StackLayout>

    </StackLayout>
  `
})
export class DatePickerDialog implements AfterViewInit {
    public prompt: string;
    public currentDate: Date;

    @ViewChild("datePickerID", null) datePicker: ElementRef;

    ngAfterViewInit(){
        (<DatePicker>this.datePicker.nativeElement).date = this.currentDate;
    }

    constructor(private params: ModalDialogParams, private page: Page) {
        this.prompt = params.context.promptMsg;
        this.currentDate = params.context.currentDate;
    }

    public close(result: string) {
        let datePickerView = <DatePicker>this.datePicker.nativeElement;
        this.params.closeCallback(datePickerView.date);
    }

}
