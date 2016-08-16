import { bootstrap } from '@angular/platform-browser-dynamic';
import { enableProdMode } from '@angular/core';
import { AppComponent, SearchComponent, GetService, RedirectService, environment } from './app/';
import { HTTP_PROVIDERS, JSONP_PROVIDERS } from '@angular/http';
import {FIREBASE_PROVIDERS,
  defaultFirebase,
  AngularFire,
  AuthMethods,
  AuthProviders,
  firebaseAuthConfig} from 'angularfire2';

if (environment.production) {
  enableProdMode();
}

bootstrap(AppComponent, [
  HTTP_PROVIDERS,
  FIREBASE_PROVIDERS,
  // Initialize Firebase app
  defaultFirebase({
    apiKey: "AIzaSyAaNBeWn34_1EsK2fM8oB2TAD37j7tuRCk",
    authDomain: "devinci-stackbot.firebaseapp.com",
    databaseURL: "https://devinci-stackbot.firebaseio.com",
    storageBucket: "devinci-stackbot.appspot.com",
  }),
  firebaseAuthConfig({
    provider: AuthProviders.Github,
    method: AuthMethods.Redirect
  }),
  SearchComponent,
  GetService,
  RedirectService
]);
