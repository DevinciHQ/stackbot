import { Component } from '@angular/core';
import { SearchComponent } from './search.component';
import { ReportComponent } from './report.component';
import { AuthButtonComponent } from './auth.button.component';


@Component({
  moduleId: module.id,
  selector: 'app-root',
  templateUrl: 'app.component.html',
  styleUrls: ['app.component.css'],
  directives: [SearchComponent, ReportComponent, AuthButtonComponent]
})
export class AppComponent {
}
