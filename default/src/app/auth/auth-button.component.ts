/**
 * Created by aashil on 8/19/16.
 */
import { Component } from '@angular/core';
import { AuthService } from './auth.service';
import { GoogleAnalyticsService } from '../shared/google.analytics.service';

@Component({
    selector: 'auth-button',
    templateUrl: 'auth-button.component.html',
    styleUrls: ['auth-button.component.css']
})
export class AuthButtonComponent {
    public loggedIn = false;

    constructor(public auth: AuthService, private ga: GoogleAnalyticsService) {
      this.auth.getUser().subscribe(
            user => {
                if (user && user.loggedIn) {
                    this.loggedIn = true;
                } else {
                    this.loggedIn = false;
                }
            }
        );
    }
    login() {
        this.ga.event('Auth', 'Login', 'click');
        this.auth.login();
    }
    logout() {
        this.ga.event('Auth', 'Logout', 'click');
        this.auth.logout();
    }
}
