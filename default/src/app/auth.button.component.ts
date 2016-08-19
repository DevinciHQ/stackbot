/**
 * Created by aashil on 8/19/16.
 */
import { Component } from '@angular/core';
import { AngularFireAuth } from 'angularfire2';

@Component({
    selector: 'auth-button',
    templateUrl: './app/auth.button.component.html',
})
export class AuthButtonComponent {
    private uid = null;
    constructor(public auth: AngularFireAuth) {
      this.auth.subscribe(
            authentication => {
                if (authentication != null) {
                    this.uid = authentication.uid;
                } else {
                    this.uid = null;
                }
            }
        );
    }
    login() {
    this.auth.login();
    }
    logout() {
    this.auth.logout();
    }
}
