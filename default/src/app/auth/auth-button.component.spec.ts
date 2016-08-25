/**
 * Created by aashil on 8/23/16.
 */


import {
  addProviders,
  inject
} from '@angular/core/testing';

import { AuthService } from './auth.service';
import { AuthButtonComponent } from './auth-button.component';
import {Subject}    from 'rxjs/Subject';


class MockAuthService {

   private token = new Subject<string>();

    // Observable string streams
    // user$ = this.user.asObservable();
    tokenEvent$ = this.token.asObservable();

    login() {
    }

    logout() {

    }

    authEvent() {
        return this.tokenEvent$;
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
                // Note that we pass XHRBackend, NOT MockBackend.
                [AuthButtonComponent, AuthService], (authButtonComponent: AuthButtonComponent, auth: MockAuthService) => {

        spyOn(auth, 'login');
        authButtonComponent.login();
        expect(auth.login).toHaveBeenCalled();
    }));
});
