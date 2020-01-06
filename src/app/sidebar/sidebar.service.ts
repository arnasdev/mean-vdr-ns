import { Subject } from "rxjs";
import { Injectable } from "@angular/core";
import { Router } from "@angular/router";


@Injectable({ providedIn: 'root' })
export class SidebarService {

    private sideBarUpdated = new Subject<{visible: boolean}>();

    getSidebarUpdateListener() {
        return this.sideBarUpdated.asObservable();
    }

    toggleSideBar(){
        this.sideBarUpdated.next({visible: undefined});
    }


    closeSideBar(){
        this.sideBarUpdated.next({visible: false});
    }
}
