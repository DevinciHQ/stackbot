import { Component } from '@angular/core';
import { AngularFire } from 'angularfire2';

@Component({
  moduleId: module.id,
  selector: 'app-root',
  templateUrl: 'app.component.html',
  styleUrls: ['app.component.css']
})
export class AppComponent {
  constructor(public af: AngularFire) {}
  login() {
    this.af.auth.login();
  }
  logout() {
    this.af.auth.logout();
  }
}
