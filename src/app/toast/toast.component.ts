import { Component, OnInit, OnDestroy } from "@angular/core";
import { ActivatedRoute, Router } from "@angular/router";
import { trigger, state, transition, animate, style } from "@angular/animations";

import { Subscription } from "rxjs";

@Component({
    selector: "ns-toast",
    templateUrl: "./toast.component.html",
    styleUrls: ["./toast.component.css"],
    animations: [
        trigger('state', [
            state("inactive", style({"transform": "translate(10,-100)"})),
            state("active", style({"transform":"translate(10,10)"})),
            transition("inactive => active", [animate("200ms ease-out")]),
            transition("active => inactive", [animate("200ms ease-out")])
        ]),
        trigger('type', [
            state("error", style({"background-color": "rgb(195,55,40)"})),
            state("success", style({"background-color": "rgb(79,159,79)"})),
            state("warning", style({"background-color": "rgb(241,144,6)"})),
            state("info", style({"background-color": "rgb(2,150,180)"})),
        ])
    ],
})
export class ToastComponent implements OnInit, OnDestroy {
    message: string ="message";
    paramSubscription: Subscription;
    toastStateString = "inactive";
    toastType = "error";
    toastState = false;
    title = "Error";

    constructor(private activatedRoute: ActivatedRoute, private router: Router) {}

    ngOnInit(){
        this.paramSubscription = this.activatedRoute.queryParams.subscribe(params => {
            if(params["message"] !== undefined && params["message"] !== ""){
                if(params["toastType"] !== undefined && params["toastType"] !== ""){

                    this.message = params["message"];
                    this.toastType = params["toastType"];

                    console.log("Showing toast");

                    if(this.toastType === "error"){
                        this.showError();
                    }else if(this.toastType === "warning"){
                        this.showWarning();
                    }else if(this.toastType === "info"){
                        this.showInfo();
                    }else if(this.toastType ==="success"){
                        this.showSuccess();
                    }

                    this.router.navigate([this.router.url.split('?')[0]]);
                }
            }
        })
    }

    ngOnDestroy() {
        this.paramSubscription.unsubscribe();
    }

    showToast(){
        this.toastState = true;
        this.toastStateString = "active";

        setTimeout(() => {
            this.hideToast();
        }, 3000);
    }

    hideToast(){
        this.toastState = false;
        this.toastStateString = "inactive";
    }

    clearToastData(){
        this.message = "";
        this.toastType = "";
    }

    showError(){
        this.title = "Error";
        this.showToast();
    }

    showSuccess(){
        this.title = "Success";
        this.showToast();
    }

    showInfo(){
        this.title = "Info";
        this.showToast();
    }

    showWarning(){
        this.title = "Warning";
        this.showToast();
    }
}
