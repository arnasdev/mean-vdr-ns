import { NgModule } from "@angular/core";
import { NativeScriptRouterModule } from "nativescript-angular/router";
import { Routes } from "@angular/router";
import { VehicleListComponent } from "./vehicles/vehicle-list/vehicle-list.component";
import { AuthGuard } from './auth/auth.guard';
import { AppComponent } from "./app.component";
import { SettingsComponent } from "./settings/settings.component";
import { PrivacyComponent } from "./privacy/privacy.component";
import { AboutComponent } from "./about/about.component";
import { TermsComponent } from "./terms/terms.component";
import { ContactComponent } from "./contact/contact.component";
import { PasswordResetComponent } from "./password-reset/password-reset.component";
import { SetPasswordComponent } from "./set-password/set-password.component";


const routes: Routes = [
    { path: '', redirectTo: "vehicles", pathMatch: "full" },
    { path: 'vehicles', component: VehicleListComponent, canActivate: [AuthGuard], runGuardsAndResolvers: 'always' },
    { path: 'password-reset', component: PasswordResetComponent, canActivate: [AuthGuard], runGuardsAndResolvers: 'always' },
    { path: 'set-password', component: SetPasswordComponent, canActivate: [AuthGuard], runGuardsAndResolvers: 'always' },
    { path: 'settings', component: SettingsComponent, canActivate: [AuthGuard], runGuardsAndResolvers: 'always'},
    { path: 'privacy', component: PrivacyComponent, canActivate: [AuthGuard], runGuardsAndResolvers: 'always'},
    { path: 'contact', component: ContactComponent, canActivate: [AuthGuard], runGuardsAndResolvers: 'always'},
    { path: 'about', component: AboutComponent, canActivate: [AuthGuard], runGuardsAndResolvers: 'always'},
    { path: 'terms', component: TermsComponent, canActivate: [AuthGuard], runGuardsAndResolvers: 'always'},
    { path: "auth", loadChildren: './auth/auth.module#AuthModule' },
];

@NgModule({
    imports: [NativeScriptRouterModule.forRoot(routes, {onSameUrlNavigation: 'reload'})],
    exports: [NativeScriptRouterModule],
    providers: [AuthGuard]
})
export class AppRoutingModule { }
