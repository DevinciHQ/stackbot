import { NgModule, NgModuleMetadataType }      from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AngularFireModule, AuthProviders, AuthMethods } from 'angularfire2';

import {
  LocationStrategy,
  HashLocationStrategy
} from '@angular/common';

import { HTTP_PROVIDERS } from '@angular/http';
import { AUTH_PROVIDERS } from 'angular2-jwt';
import { FocusMeDirective } from './shared/focus-me.directive';
import { BackendService } from './shared/backend.service';
import { KeysPipe } from './shared/keys.pipe';


import { AppComponent }  from './app.component';
import { ReportComponent } from './report/index';
import { AuthService, AuthButtonComponent, AuthIntegrationsComponent } from './auth/index';
import { SearchComponent } from './search/index';

import { routing, appRoutingProviders } from './app.routing';

// DO NOT DELETE: This is needed of the compiler says, Cannot find namespace 'firebase'.
/* tslint:disable */
import * as firebase from 'firebase';
/* tslint:enable */

const firebaseConfig = {
    apiKey: 'AIzaSyAaNBeWn34_1EsK2fM8oB2TAD37j7tuRCk',
    authDomain: 'devinci-stackbot.firebaseapp.com',
    databaseURL: 'https://devinci-stackbot.firebaseio.com',
    storageBucket: 'devinci-stackbot.appspot.com',
};

// Put provider and method for authentication in separate constant.
const firebaseAuthConfig = {
    provider: AuthProviders.Github,
    method: AuthMethods.Popup,
    remember: 'default',
    scope: ['user:email']
};


let providers = [
    AUTH_PROVIDERS,
    HTTP_PROVIDERS,
    AuthService,
    BackendService,
    appRoutingProviders,
    {provide: LocationStrategy, useClass: HashLocationStrategy}
];

let declarations = [
    SearchComponent,
    ReportComponent,
    AuthButtonComponent,
    AppComponent,
    FocusMeDirective,
    AuthIntegrationsComponent,
    KeysPipe,
];

let imports = [
    AngularFireModule.initializeApp(firebaseConfig, firebaseAuthConfig),
    FormsModule,
    CommonModule,
    BrowserModule,
    routing
];


@NgModule(<NgModuleMetadataType>{
    providers: [...providers],
    declarations: [...declarations],
    imports: [...imports],
    bootstrap: [AppComponent]
})
export class AppModule { }
