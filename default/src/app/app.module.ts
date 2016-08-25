import { NgModule, NgModuleMetadataType }      from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService, AuthButtonComponent} from './auth/index';
import { SearchComponent } from './search/index';
import { HTTP_PROVIDERS } from '@angular/http';
import { AppComponent }  from './app.component';
import { AngularFireModule, AuthProviders, AuthMethods } from 'angularfire2';
import { FocusMeDirective} from './shared/focus-me.directive';

import {AUTH_PROVIDERS} from 'angular2-jwt';
import {ReportComponent} from './report/index';

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
    method: AuthMethods.Popup
};


let providers = [
    AUTH_PROVIDERS,
    HTTP_PROVIDERS,
    AuthService,
];

let declarations = [
    SearchComponent,
    ReportComponent,
    AuthButtonComponent,
    AppComponent,
    FocusMeDirective
];

let imports = [
    AngularFireModule.initializeApp(firebaseConfig, firebaseAuthConfig),
    FormsModule,
    CommonModule,
    BrowserModule,
];


@NgModule(<NgModuleMetadataType>{
    providers: [...providers],
    declarations: [...declarations],
    imports: [...imports],
    bootstrap: [AppComponent]
})
export class AppModule { }
