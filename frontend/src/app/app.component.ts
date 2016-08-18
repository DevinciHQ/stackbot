import { Component } from '@angular/core';
import { AngularFire } from 'angularfire2';
import { SearchComponent } from './search.component';
import { ReportComponent } from './report.component';


@Component({
  moduleId: module.id,
  selector: 'app-root',
  templateUrl: 'app.component.html',
  styleUrls: ['app.component.css'],
  directives: [SearchComponent, ReportComponent]
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
