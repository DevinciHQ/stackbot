/**
 * Created by aashil on 8/19/16.
 */
import { Component } from '@angular/core';
import { AuthService } from './auth.service';


@Component({
    selector: 'auth-button',
    templateUrl: 'auth-button.component.html',
    styleUrls: ['auth-button.component.css']
})
export class AuthButtonComponent {
    public loggedIn = false;

    constructor(public auth: AuthService) {
      this.auth.getUser().subscribe(
            authentication => {
                if (authentication != null) {
                    this.loggedIn = true;
                } else {
                    this.loggedIn = false;
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
