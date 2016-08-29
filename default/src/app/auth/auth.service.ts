/**
 * Created by aashil on 8/12/16.
 */

import { AngularFireAuth } from 'angularfire2';
import { Injectable } from '@angular/core';
import { Observable, BehaviorSubject }  from 'rxjs/Rx';
import { User } from '../shared/user';
import { BackendService } from '../shared/backend.service';


// Declare ga function as ambient
declare var ga: Function;

@Injectable()
export class AuthService {

    private user = new BehaviorSubject<User>(null);
    private token = new BehaviorSubject<string>(null);

    constructor(private fb_auth: AngularFireAuth, private backend: BackendService) {

        this.fb_auth.subscribe(
            // An auth event happened.
            authEvent => {
                // The user authenticated with firebase auth. Either via an explicit login
                // or by refreshing the page.
                if (authEvent) {
                    let _self = this;
                    authEvent.auth.getToken().then(function(idToken) {
                        _self.token.next(idToken);
                        // Update user only AFTER we get the token so that clients can just Subscribe to user and not jwt token,
                        // which will change more often as the token needs to be updated for auth purposes.
                        // Also, only update the user ONCE, so that user events don't cause infinite loops.
                        if (! _self.user.getValue()) {
                             console.log('update user');
                             _self.user.next(_self.userFromAuth(authEvent));
                        }
                    }).catch(function(error) {
                       console.log(error);
                    });
                // The user logged out, or hasn't logged in yet.
                } else {
                    this.user.next(null);
                    this.token.next(null);
                }
            }
        );

        // Register the user_id with google analytics.
        this.user.subscribe(
            (user: User) => {
                if (user) {
                    ga('set', 'userId', user.uid); // Set the user ID using signed-in user_id.
                } else {
                    ga('unset', 'userId', null);
                }
            }
        );

        // Add and remove the token from local storage.
        this.token.subscribe(
            (token: string) => {
                if (token) {
                    console.log('update token')
                    localStorage.setItem('id_token', token);
                } else {
                    localStorage.removeItem('id_token');
                }
            }
        );


    }

    getUser(): BehaviorSubject<User> {
        return this.user;
    }

    getToken() {
        return this.token;
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

    userFromAuth(auth: any): User {
        let fields = {
            uid: auth.uid
        };
        return new User(fields);
    }
}

