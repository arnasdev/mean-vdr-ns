import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';
import { map } from 'rxjs/operators';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Router } from '@angular/router';
import { DatePipe } from '@angular/common';

import { Vehicle } from './vehicle.model';
import {
    alert,
    confirm
} from "tns-core-modules/ui/dialogs";
import { RouterExtensions } from 'nativescript-angular/router';



const BACKEND_URL = 'http://vdrapi-env.d5xyfzxdwi.eu-west-1.elasticbeanstalk.com/api/vehicles/';
//const BACKEND_URL = 'http://192.168.137.2:3000/api/vehicles/';

@Injectable({providedIn: 'root'})
export class VehiclesService {

  private vehicles: Vehicle[] = [];

  private vehiclesUpdated = new Subject<{vehicles: Vehicle[]}>();

  constructor(private http: HttpClient, private router: Router, private datePipe: DatePipe, private routerExtensions: RouterExtensions) { }

  getVehicles() {
    this.http
      .get<{message: string, vehicles: any}>(BACKEND_URL)
      .pipe(map(vehicleData => {
        return {
          vehicles: vehicleData.vehicles.map(vehicle => {
            return {
              id: vehicle._id,
              registration: vehicle.registration,
              manufacturer: vehicle.manufacturer,
              model: vehicle.model,
              tax: vehicle.tax,
              nct: vehicle.nct,
              insurance: vehicle.insurance,
              service: vehicle.service,
              license: vehicle.license,
              cpc: vehicle.cpc
            };
          }),
        };
      })
    )
    .subscribe((mappedVehicleData) => {
      this.vehicles = mappedVehicleData.vehicles;
      this.sendVehiclesUpdated();
    });
  }

  getVehicleUpdateListener() {
    return this.vehiclesUpdated.asObservable();
  }

  addVehicle(registration: string, manufacturer: string, model: string) {
    const postData = {
      registration,
      manufacturer,
      model,
      tax: 'N/A',
      nct: 'N/A',
      insurance: 'N/A',
      service: 'N/A',
      license: 'N/A',
      cpc: 'N/A'
    };

    this.http
      .post<{message: string, vehicle: Vehicle}>(BACKEND_URL, postData)
      .subscribe((createdVehicle) => {
          this.vehicles.push(createdVehicle.vehicle);
          this.sendVehiclesUpdated();
          this.routerExtensions.navigate(['/vehicles'], { queryParams: {message: "Vehicle added", toastType: "success" },clearHistory: true});
      });
  }

  editVehicle(id: string, registration: string, vehicleData: {
    nct?: Date,
    tax?: Date,
    insurance?: Date,
    service?: Date,
    license?: Date,
    cpc?: Date
    }) {
    const editingVehicle: Vehicle = this.vehicles[this.vehicles.findIndex(v => v.registration === registration)];
    const dateFormat = 'd MMM yy';

    if (vehicleData.nct) {
      editingVehicle.nct = this.datePipe.transform(vehicleData.nct, dateFormat);
    }

    if (vehicleData.tax) {
      editingVehicle.tax = this.datePipe.transform(vehicleData.tax, dateFormat);
    }

    if (vehicleData.insurance) {
      editingVehicle.insurance = this.datePipe.transform(vehicleData.insurance, dateFormat);
    }

    if (vehicleData.service) {
      editingVehicle.service = this.datePipe.transform(vehicleData.service, dateFormat);
    }

    if (vehicleData.license) {
      editingVehicle.license = this.datePipe.transform(vehicleData.license, dateFormat);
    }

    if (vehicleData.cpc) {
      editingVehicle.cpc = this.datePipe.transform(vehicleData.cpc, dateFormat);
    }

    this.http
      .put(BACKEND_URL + id, editingVehicle)
      .subscribe(() => {
        this.sendVehiclesUpdated();
        this.routerExtensions.navigate(['/vehicles'], { queryParams: {message: "Vehicle edited", toastType: "success" },clearHistory: true});
      });
  }

  searchRegistration(registration: string) {

    // this.toastrService.info('Searching for registration...');

    this.http
      .get<{data: string}>(BACKEND_URL + 'search/' + registration)
      .subscribe(data => {
        const startTable = data.data.indexOf('<table>');
        const endTable = data.data.indexOf('</table>');

        data.data = data.data.substr(startTable + 7, endTable - startTable - 7);
        data.data = data.data.replace(new RegExp('<|>|/', 'g'), '');

        const makeStart = data.data.indexOf('Makethtd')
        const modelStart = data.data.indexOf('tdtrtrthModel');
        const descriptionStart = data.data.indexOf('tdtrtr class="alt"thDescriptionthtd');
        const engineStart = data.data.indexOf('tdtrtrthEngine Capacitythtd');

        const make = data.data.substr(makeStart + 8, modelStart - makeStart - 8);
        const model = data.data.substr(modelStart + 17, descriptionStart - modelStart - 17);
        const description = data.data.substr(descriptionStart + 35, engineStart - descriptionStart - 35);

        registration = registration.toUpperCase().replace(new RegExp('-', 'g'), '');

        if (make === '' || model === '') {
            let options = {
                title: "Alert",
                message: "Registration not found",
                okButtonText: "OK"
            };
            alert(options).then(() => {
            });
        } else {
            let options = {
                title: "Add vehicle",
                message: "Add vehicle: " + registration+ " " + make + " "+ model +"?",
                okButtonText: "Yes",
                cancelButtonText: "No",
            };

            confirm(options).then(result => {
                if(result){
                    this.addVehicle(registration, make, model);
                }
            });
        }
    });

  }

  promptDeleteVehicle(registration: string){
    let options = {
        title: "Delete vehicle",
        message: "Delete this vehicle?",
        okButtonText: "Yes",
        cancelButtonText: "No",
    };

    confirm(options).then(result => {
        if(result){
            this.deleteVehicle(registration);
        }
  });
}


deleteVehicle(registration: string) {
    const deleteIndex = this.vehicles.findIndex(o => o.registration === registration);
    const id = this.vehicles[deleteIndex].id;

    // alert(deleteIndex).then(() => {
        // alert(id).then(() => {
            this.http.delete(BACKEND_URL + id ).subscribe((result) => {
                // alert(result);
                this.vehicles.splice(deleteIndex, 1);
                this.sendVehiclesUpdated();
                this.routerExtensions.navigate(['/vehicles'], { queryParams: {message: "Vehicle deleted", toastType: "success" },clearHistory: true});
            });
        //});
   // });

}


  sendVehiclesUpdated() {
    this.vehiclesUpdated.next({
      vehicles: [...this.vehicles]
    });
  }
}

//   findVehicleImageURL(manufacturer: string) {

//   }
