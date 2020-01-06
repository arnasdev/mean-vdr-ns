import { NgModule } from '@angular/core';
import { NativeScriptRouterModule } from "nativescript-angular/router";
import { Routes } from '@angular/router';

import { LoginComponent } from './login/login.component';
import { SignupComponent } from './signup/signup.component';

const routes: Routes = [
    { path: 'login', component: LoginComponent },
    { path: 'signup', component: SignupComponent }
];

@NgModule({
  imports: [
    NativeScriptRouterModule.forChild(routes)
  ],
  exports: [ NativeScriptRouterModule ]
})
export class AuthRoutingModule {}
