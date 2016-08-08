import { Component } from '@angular/core';
import { AngularFire, AuthProviders, AuthMethods } from 'angularfire2';

@Component({
  //moduleId: module.id,
  selector: 'my-app',
  template: `
  <div> {{ (af.auth | async)?.uid }} </div>
  <button (click)="login()">Login With Twitter</button>
  `,
})
export class AppComponent {
  constructor(public af: AngularFire) {}
  login() {
    this.af.auth.login();
  }
}
