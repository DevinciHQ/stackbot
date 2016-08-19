import { Component } from '@angular/core';
import { SearchComponent } from './search.component';
import { ReportComponent } from './report.component';
import { AuthButtonComponent } from './auth.button.component';
import { AngularFireAuth } from 'angularfire2';

// Declare ga function as ambient
declare var ga: Function;

@Component({
    moduleId: module.id,
    selector: 'app-root',
    templateUrl: 'app.component.html',
    styleUrls: ['app.component.css'],
    directives: [SearchComponent, ReportComponent, AuthButtonComponent]
})
export class AppComponent {

    constructor (private auth: AngularFireAuth) {

        // Subscribe to the authentication events of angularfire2 so we can update
        // the UID on Google Analytics.
        this.auth.subscribe(
            authEvent => {
                if (authEvent != null) {
                    ga('set', 'userId', authEvent.uid); // Set the user ID using signed-in user_id.
                }
            }
        );
    }
}
