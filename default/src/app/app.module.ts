import { NgModule }      from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService, AuthButtonComponent} from './auth/index';
import { SearchComponent } from './search/index';
import { HTTP_PROVIDERS } from '@angular/http';
import { AppComponent }  from './app.component';
import { AngularFireModule, AuthProviders, AuthMethods } from 'angularfire2';
import {AUTH_PROVIDERS} from 'angular2-jwt';
import {ReportComponent} from './report/index';

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


@NgModule({
    // All the modules required by the application fall here.
    imports:      [ AngularFireModule.initializeApp(firebaseConfig, firebaseAuthConfig),
                    BrowserModule,
                    CommonModule,
                    FormsModule ],
    // Put all the components required by the application in here.
    declarations: [ AppComponent, SearchComponent, ReportComponent, AuthButtonComponent],
    // Put all the immediate services required by the app.module in here. No need to put the services used by
    // the rest of the application.
    providers:    [ AUTH_PROVIDERS, HTTP_PROVIDERS,  AuthService],
    bootstrap:    [ AppComponent ]
})
export class AppModule { }
