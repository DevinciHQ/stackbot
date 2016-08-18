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
    this.af.auth.subscribe(
      auth => {
        if (auth != null) {
          document.cookie = 'uid=' + auth.uid;
        }
      }
    );
  }
  logout() {
    this.af.auth.logout();
    document.cookie = 'uid=;"+"expires=Thu, 01 Jan 1970 00:00:01 GMT';
  }
}
