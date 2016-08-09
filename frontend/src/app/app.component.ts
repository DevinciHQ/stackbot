import { Component } from '@angular/core';
import { AngularFire } from 'angularfire2';

@Component({
  moduleId: module.id,
  selector: 'app-root',
  template: `
    <div> {{ (af.auth | async)?.uid }} </div>
    <button (click)="login()">Login</button>
    `,
  styleUrls: ['app.component.css']
})
export class AppComponent {
  title = 'app works!';
  constructor(public af: AngularFire) {}
  login() {
    this.af.auth.login();
  }
}
