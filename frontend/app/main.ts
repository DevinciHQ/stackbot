import { bootstrap }    from '@angular/platform-browser-dynamic';
import { AppComponent } from './app.component';
import {FIREBASE_PROVIDERS,
  defaultFirebase,
  AngularFire,
  AuthMethods,
  AuthProviders,
  firebaseAuthConfig} from 'angularfire2';

bootstrap(AppComponent, [
    FIREBASE_PROVIDERS,
    defaultFirebase({
    apiKey: "AIzaSyAaNBeWn34_1EsK2fM8oB2TAD37j7tuRCk",
    authDomain: "devinci-stackbot.firebaseapp.com",
    databaseURL: "https://devinci-stackbot.firebaseio.com/",
    storageBucket: "http://devinci-stackbot.appspot.com/",
  }),
    firebaseAuthConfig({
    provider: AuthProviders.Twitter,
    method: AuthMethods.Redirect
  })
]);
