import { BrowserModule } from '@angular/platform-browser';
import { platformBrowserDynamic } from '@angular/platform-browser-dynamic';
import { enableProdMode, NgModule } from '@angular/core';
import { AppComponent, environment } from './';
import { AngularFireModule } from 'angularfire2';
import {HTTP_PROVIDERS} from '@angular/http';
import {AUTH_PROVIDERS} from 'angular2-jwt';
import * as firebase from 'firebase';

if (environment.production) {
    enableProdMode();
}

// Must export the config
export const firebaseConfig = {
    apiKey: 'AIzaSyAaNBeWn34_1EsK2fM8oB2TAD37j7tuRCk',
    authDomain: 'devinci-stackbot.firebaseapp.com',
    databaseURL: 'https://devinci-stackbot.firebaseio.com',
    storageBucket: 'devinci-stackbot.appspot.com',
};

@NgModule({
  imports: [
    BrowserModule,
    AngularFireModule.initializeApp(firebaseConfig),
  ],
  declarations: [ AppComponent ],
  bootstrap: [ AppComponent ]
})
export class AppModule {}
