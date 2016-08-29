/**
 * Created by aashil on 8/12/16.
 */

import { AngularFireAuth } from 'angularfire2';
import { Injectable } from '@angular/core';
import { Observable, BehaviorSubject }  from 'rxjs/Rx';
import { User } from '../shared/user';
import { BackendService } from '../shared/backend.service';
import { Integration } from '../shared/integration';


// Declare ga function as ambient
declare var ga: Function;

@Injectable()
export class AuthService {

    private user = new BehaviorSubject<User>(null);
    private token = new BehaviorSubject<string>(null);
    private integrations = new BehaviorSubject<{ [key: string]: Integration}>(
        {
        'github': new Integration({name: 'github', active: false, pending: true})
        }
    );

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

    getIntegrations(refresh= false) {
        if (refresh) {
            this.refreshIntegrations();
        }
        return this.integrations;
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

    refreshIntegrations() {

        return this.backend.request('/api/integration', {}).subscribe(
            (data: {}[]) => {

                let _self = this;

                // Iterate over all of our integrations, updating them to active if they're found.
                let keys = Object.keys(this.integrations.value);
                for (let key of keys) {
                    let active = false;
                    for (let item of data) {
                        if (key === item['type']) {
                            active = true;
                        }
                    }
                    _self.integrations.value[key].active = active;
                    _self.integrations.value[key].pending = false;
                }
            }
        );
    }

    disableIntegration(type: string) {
        let req = this.backend.request('/auth/' + type + '/delete', {});
        let _self = this;
        req.subscribe(
            data => {
                console.log(data);
                _self.integrations.value[type].active = false;
            }
        );
        return req;
    }

    trigger_oauth(type: string) {

        let _self = this;

        if (type !== 'github') {
            console.log('type not available: ' + type);
            return;
        }
        if (!this.user) {
            console.log('User is not logged in');
            return;
        }

        // We need to trigger a placeholder popup immediately or the browser will block it.
        // We'll change the location of it later. Note that it it was blocked, popup is null.
        // TODO: Add a method for when a popup is blocked (just redirect the user's current window)
        let popup: Window = this.create_popup('', 'Integrating Account', 800, 600);

        let oauthEvent = Observable.fromEvent(window, 'message')
            .filter(event => event['origin'] === _self.backend.getBackendUrl())
            .map(() => {
                popup.close();
                return true;
            });

        this.backend.request('/auth/' + type, {}).subscribe(
            data => {
                if (! data['redirect_for_auth']) {
                    console.log('payload missing redirect_for_auth:', data);
                }
                // Update the location of the popup to the redirect path to initiate the process.
                popup.location.href = data['redirect_for_auth'];
                let message_trigger = Observable.interval(1000).takeUntil(oauthEvent);
                message_trigger.subscribe(
                    x => {
                      popup.postMessage('..are you done?', this.backend.getBackendUrl());
                      console.log('try', x);
                    }
                );

            }
        );

        return oauthEvent;
    }

    create_popup(url: string, title: string, w: number, h: number) {
        // Fixes dual-screen position                         Most browsers      Firefox
        let dualScreenLeft = window.screenLeft !== undefined ? window.screenLeft : 0;
        let dualScreenTop = window.screenTop !== undefined ? window.screenTop : 0;

        let width = window.innerWidth ? window.innerWidth : document.documentElement.clientWidth ? document.documentElement.clientWidth : screen.width;
        let height = window.innerHeight ? window.innerHeight : document.documentElement.clientHeight ? document.documentElement.clientHeight : screen.height;

        let left = ((width / 2) - (w / 2)) + dualScreenLeft;
        let top = ((height / 2) - (h / 2)) + dualScreenTop;
        let newWindow = window.open(url, title, 'scrollbars=yes, width=' + w + ', height=' + h + ', top=' + top + ', left=' + left);

        // Puts focus on the newWindow
        if (window.focus) {
            newWindow.focus();
        }
        return newWindow;
    }
}

