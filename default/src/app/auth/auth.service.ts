/**
 * Created by aashil on 8/12/16.
 */

import { AngularFireAuth } from 'angularfire2';
import { Injectable } from '@angular/core';
import {Subject}    from 'rxjs/Subject';
import {User} from '../shared/user';

// Declare ga function as ambient
declare var ga: Function;

@Injectable()
export class AuthService {

    private user: User;
    private token = new Subject<string>();

    // Observable string streams
    // user$ = this.user.asObservable();
    tokenEvent$ = this.token.asObservable();

    constructor(private fb_auth: AngularFireAuth) {

        this.fb_auth.subscribe(
            // An auth event happened.
            authEvent => {
                // The user authenticated with firebase auth. Either via an explicit login
                // or by refreshing the page.
                if (authEvent) {
                    let _self = this;
                    authEvent.auth.getToken().then(function(idToken) {
                        localStorage.setItem('id_token', idToken);
                        _self.user = _self.userFromAuth(authEvent);
                        _self.token.next(idToken);
                        ga('set', 'userId', authEvent.uid); // Set the user ID using signed-in user_id.
                    }).catch(function(error) {
                       console.log(error);
                    });
                // The user logged out, or hasn't logged in yet.
                } else {
                    console.log('logout');
                    localStorage.removeItem('id_token');
                    this.token.next(null);
                    ga('unset', 'userId', null);
                }
            }
        );
    }


    login() {
        this.fb_auth.login();
        //     .then( ret => {
        //     localStorage.setItem('github_token', ret.github.accessToken);
        //     console.log('ret', ret);
        // });
        // console.log('login');
    }

    logout() {
        this.fb_auth.logout();
        // localStorage.removeItem('github_token');
        // console.log('logout');
    }

    authEvent() {
        return this.tokenEvent$;
    }

    userFromAuth(auth: any): User {
        let fields = {
            uid: auth.uid
        };
        return new User(fields);
    }
}
