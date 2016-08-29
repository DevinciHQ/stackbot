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



class MockAuthService {

   private token = new BehaviorSubject<string>(null);
   private user = new BehaviorSubject<User>(null);
    // Observable string streams
    // user$ = this.user.asObservable();

    login() {
       this.user.next(new User({uid: '123abc', email: 'fake.test@example.com'}));
    }

    logout() {
        this.user.next(null);
    }

    getUser() {
        return this.user;
    }

}

describe('AuthButtonComponent', () => {
    beforeEach(() => {
        addProviders([
            AuthButtonComponent,
            {provide: AuthService, useClass: MockAuthService}
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
});
