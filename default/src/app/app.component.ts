import { Component } from '@angular/core';
import { SearchComponent } from './search/index';
import { ReportComponent } from './report/index';
import { AuthButtonComponent } from './auth/index';

@Component({
    moduleId: module.id,
    selector: 'app-root',
    templateUrl: 'app.component.html',
    styleUrls: ['app.component.css'],
    directives: [ReportComponent, SearchComponent, AuthButtonComponent]
})
export class AppComponent {
}
