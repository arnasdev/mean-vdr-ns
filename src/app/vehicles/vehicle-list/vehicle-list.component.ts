import { Component, OnInit, OnDestroy } from "@angular/core";
import { trigger, state, transition, animate, style } from "@angular/animations";
import { Subscription } from 'rxjs';
import { ModalDialogService, ModalDialogOptions } from "nativescript-angular/modal-dialog";
import { ViewContainerRef } from "@angular/core";
import * as SocialShare from "nativescript-social-share";
import * as utils from "tns-core-modules/utils/utils"

import { Vehicle } from "../vehicle.model";
import { VehiclesService } from "../vehicles.service";
import { AuthService } from "~/app/auth/auth.service";
import { DatePickerDialog } from "../datepicker-dialog/datepicker-dialog";

enum indicatorStatus {
    Okay = 'green',
    Warning = 'orange',
    Error = 'red',
    Available = 'blue',
    Unavailable = 'gray'
}

@Component({
    selector: "ns-vehicle-list",
    templateUrl: "./vehicle-list.component.html",
    styleUrls: ["./vehicle-list.component.css"],
    animations: [
        trigger('state', [
            state("inactive", style({"height": "0px"})),
            state("active", style({"height":"840px"})),
            transition("inactive => active", [animate("200ms ease-out")]),
            transition("active => inactive", [animate("200ms ease-out")])
        ])
    ],
})
export class VehicleListComponent implements OnInit, OnDestroy {

    constructor(private vehiclesService: VehiclesService, private authService: AuthService, private modalService: ModalDialogService, private viewContainerRef: ViewContainerRef){}

    public vehicles: Vehicle[];
    visibility = 'collapsed';
    allowMultiple = false;
    current: any;
    isAuthenticated = false;
    vehicleSubscription: Subscription;
    authSubscription: Subscription;

    ngOnInit() {
        this.isAuthenticated = this.authService.getIsAuth();

        if (this.isAuthenticated) {
          this.vehiclesService.getVehicles();
        }

        this.vehicleSubscription = this.vehiclesService
          .getVehicleUpdateListener()
          .subscribe((vehicleData: {vehicles: Vehicle[]}) => {
            this.vehicles = vehicleData.vehicles;
        });

        this.authSubscription = this.authService
          .getAuthStatusListener()
          .subscribe(authStatus => {
            this.isAuthenticated = authStatus;
        });
    }

    ngOnDestroy() {
        this.vehicleSubscription.unsubscribe();
        this.authSubscription.unsubscribe();
    }

    toggleVisibility(collapsable, state)
    {
        this.changeState(state);
    }

    showDatePicker(dateString: string): Promise<Date> {
        let currentDate: Date;

        if(dateString === "N/A"){
            currentDate = new Date();
        } else {
            currentDate = new Date(dateString);
        }

        let options: ModalDialogOptions = {
            viewContainerRef: this.viewContainerRef,
            context: {currentDate, promptMsg: "Select a date"},

        };

        return this.modalService.showModal(DatePickerDialog, options);
    }

    changeState(obj) {

        console.log("changestte");

        if (this.allowMultiple === false) {
			if (this.current === undefined) {
				this.current = obj;
			}
			else if (obj !== this.current) {
				this.current.state = 'inactive';
			}
		}
        let state = obj.state;
        state = state === 'active' ? 'inactive' : 'active';
        obj.state = state;
        this.current = obj;
    }

    editTax(id: string, registration: string, taxDate: string) {
        this.showDatePicker(taxDate).then(result => {
            let date = new Date(result);
            this.vehiclesService.editVehicle(id, registration, { tax: date });
        });
      }

    editNct(id: string, registration: string, nctDate: string) {
        this.showDatePicker(nctDate).then(result => {
            let date = new Date(result);
            this.vehiclesService.editVehicle(id, registration, { nct: date });
        });
    }

    editInsurance(id: string, registration: string, insuranceDate: string) {
        this.showDatePicker(insuranceDate).then(result => {
            let date = new Date(result);
            this.vehiclesService.editVehicle(id, registration, { insurance: date });
        });
    }

    editService(id: string, registration: string, serviceDate: string) {
        this.showDatePicker(serviceDate).then(result => {
            let date = new Date(result);
            this.vehiclesService.editVehicle(id, registration, { service: date });
        });
    }

    editLicense(id: string, registration: string, licenseDate: string) {
        this.showDatePicker(licenseDate).then(result => {
            let date = new Date(result);
            this.vehiclesService.editVehicle(id, registration, { license: date });
        });
    }

    editCpc(id: string, registration: string, cpcDate: string) {
        this.showDatePicker(cpcDate).then(result => {
            let date = new Date(result);
            this.vehiclesService.editVehicle(id, registration, { cpc: date });
        });
    }

    deleteVehicle(registration: string){
        this.vehiclesService.deleteVehicle(registration);
    }

    shareApp() {
        SocialShare.shareUrl("www.google.ie", "Check out the Vehicle Reminders app!", "Vehicle Reminders");
    }

    bookNct(){
        utils.openUrl("https://www.ncts.ie/1101");
    }

    insuranceQuote() {
        utils.openUrl("https://securequotes.libertyinsurance.ie/LibertyWeb/get-a-quote.html?aWhiteLabelId=1&advertCode=&promoCode=");
    }

    roadTax() {
        utils.openUrl("https://www.motortax.ie/OMT/omt.do");
    }

    deleteVehiclePrompt(registration: string){
        this.vehiclesService.promptDeleteVehicle(registration);
    }

    getIndicatorColor(dateString: string) {
        let status: indicatorStatus;

        if(dateString === "N/A"){
            status = indicatorStatus.Warning;
            return status as string;
        }

        const date = new Date(dateString);
        const now = Date.now();

        if (date.getTime() > now) {
            status = indicatorStatus.Okay;
        } else {
            status = indicatorStatus.Error;
        }

        return status as string;
    }

    getOverallIndicatorColor(vehicle: Vehicle) {
        const taxColor = this.getIndicatorColor(vehicle.tax);
        const nctColor = this.getIndicatorColor(vehicle.nct);
        const insuranceColor = this.getIndicatorColor(vehicle.insurance);
        const serviceColor = this.getIndicatorColor(vehicle.service);
        const licenseColor = this.getIndicatorColor(vehicle.license);

        if (taxColor === 'red' || nctColor === 'red' || insuranceColor === 'red' ||serviceColor === 'red' || licenseColor === 'red') {
            return 'red';
        } else if (taxColor === 'orange' || nctColor === 'orange' || insuranceColor === 'orange' || serviceColor === 'orange' || licenseColor === 'orange') {
            return 'orange';
        } else {
            return 'green';
        }
    }
}
