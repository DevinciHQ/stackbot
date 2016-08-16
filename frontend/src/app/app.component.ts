import { Component } from '@angular/core';
import { AngularFire } from 'angularfire2';
import { SearchComponent } from './search.component';

@Component({
  moduleId: module.id,
  selector: 'app-root',
  templateUrl: 'app.component.html',
  styleUrls: ['app.component.css'],
  directives: [SearchComponent]
})
export class AppComponent {
  constructor(public af: AngularFire, public search: SearchComponent) {}
  login() {
    this.af.auth.login();
  }
  logout() {
    this.af.auth.logout();
  }
}
