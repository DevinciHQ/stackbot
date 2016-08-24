import {bootstrap} from '@angular/platform-browser-dynamic';
import {enableProdMode} from '@angular/core';
import { AppModule } from './app/app.module';



import {AppComponent, environment} from './app';
import {AuthService} from './app/auth/index';
import {HTTP_PROVIDERS} from '@angular/http';
import {
    FIREBASE_PROVIDERS,
    defaultFirebase,
    AuthMethods,
    AuthProviders,
    firebaseAuthConfig
} from 'angularfire2';
import {AUTH_PROVIDERS} from 'angular2-jwt';

if (environment.production) {
    enableProdMode();
}

bootstrap(AppComponent, [
    HTTP_PROVIDERS,
    FIREBASE_PROVIDERS,
    // Initialize Firebase app
    defaultFirebase({
        apiKey: 'AIzaSyAaNBeWn34_1EsK2fM8oB2TAD37j7tuRCk',
        authDomain: 'devinci-stackbot.firebaseapp.com',
        databaseURL: 'https://devinci-stackbot.firebaseio.com',
        storageBucket: 'devinci-stackbot.appspot.com',
    }),
    firebaseAuthConfig({
        provider: AuthProviders.Github,
        method: AuthMethods.Popup
    }),
    AUTH_PROVIDERS,
    AuthService
]);
