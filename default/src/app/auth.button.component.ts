/**
 * Created by aashil on 8/19/16.
 */
import { Component } from '@angular/core';
import { AuthService } from './auth.service';

@Component({
    selector: 'auth-button',
    templateUrl: './app/auth.button.component.html',
    styleUrls: ['./app/auth.button.component.css']
})
export class AuthButtonComponent {
    private loggedIn = false;

    constructor(public auth: AuthService) {
      this.auth.authEvent().subscribe(
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
