import { NgModule } from '@angular/core';
import { NativeScriptRouterModule } from "nativescript-angular/router";
import { Routes } from '@angular/router';

import { LoginComponent } from './login/login.component';
import { SignupComponent } from './signup/signup.component';
import { FacebookLinkComponent } from './fb-link/fb-link.component';
import { AuthIndexComponent } from './index/index.component';

const routes: Routes = [
    { path: 'index', component: AuthIndexComponent },
    { path: 'login', component: LoginComponent },
    { path: 'signup', component: SignupComponent },
    { path: 'fb-link', component: FacebookLinkComponent }
];

@NgModule({
  imports: [
    NativeScriptRouterModule.forChild(routes)
  ],
  exports: [ NativeScriptRouterModule ]
})
export class AuthRoutingModule {}
