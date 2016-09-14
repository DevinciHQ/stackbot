/**
 * Created by aashil on 8/23/16.
 */


import {
  addProviders,
  inject
} from '@angular/core/testing';

import { AuthService } from './auth.service';
import { AuthButtonComponent } from './auth-button.component';
import {BehaviorSubject}    from 'rxjs/Rx';
import { User } from '../shared/user';
import { GoogleAnalyticsService } from '../shared/google.analytics.service';



class MockAuthService {

   private user = new BehaviorSubject<User>(null);
    // Observable string streams
    // user$ = this.user.asObservable();

    login() {
       this.user.next(new User(new User({uid: '123abc', email: 'fake.test@example.com', loggedIn: true})));
    }

    logout() {
        this.user.next(new User());
    }

    getUser() {
        return this.user;
    }

}

class MockGoogleAnalyticsService {
    event(eventCategory: string, eventAction: string, eventLabel: string) {
    }
    setUserId(userId: string) {
    }
    unsetUserId() {
    }
}

describe('AuthButtonComponent', () => {
    beforeEach(() => {
        addProviders([
            AuthButtonComponent,
            {provide: AuthService, useClass: MockAuthService},
            {provide: GoogleAnalyticsService, useClass: MockGoogleAnalyticsService}
        ]);
    });

    it('should call the login function of the AuthService', inject(
                // Note that we pass AuthService, NOT MockAuthService.
                [AuthButtonComponent, AuthService], (authButtonComponent: AuthButtonComponent, auth: MockAuthService) => {

        spyOn(auth, 'login').and.callThrough();
        authButtonComponent.login();
        expect(auth.login).toHaveBeenCalled();
        expect(authButtonComponent.loggedIn).toBe(true);
    }));

    it('should call the logout function of the AuthService', inject(
                // Note that we pass AuthService, NOT MockAuthService
                [AuthButtonComponent, AuthService], (authButtonComponent: AuthButtonComponent, auth: MockAuthService) => {

        spyOn(auth, 'logout').and.callThrough();
        auth.login();
        authButtonComponent.logout();
        expect(auth.logout).toHaveBeenCalled();
        expect(authButtonComponent.loggedIn).toBe(false);

    }));

    it('should record GA event for login and logout', inject(
                // Note that we pass AuthService, NOT MockAuthService
                [AuthButtonComponent, GoogleAnalyticsService], (authButtonComponent: AuthButtonComponent,
                                                                             ga: MockGoogleAnalyticsService
        ) => {

        spyOn(ga, 'event');
        authButtonComponent.login();
        expect(ga.event).toHaveBeenCalledWith('Auth', 'Login', 'click');
        authButtonComponent.logout();
        expect(ga.event).toHaveBeenCalledWith('Auth', 'Logout', 'click');
    }));
});
