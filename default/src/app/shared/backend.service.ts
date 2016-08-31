import { Injectable }     from '@angular/core';
import { Response } from '@angular/http';
import { Observable }     from 'rxjs/Observable';
import { Observer }     from 'rxjs/Observer';
import 'rxjs/add/operator/catch';
import { AuthHttp, tokenNotExpired } from 'angular2-jwt';
import { AngularFireAuth } from 'angularfire2';

@Injectable()
export class BackendService {
    private _backendUrl: string = 'http://localhost:8081';

    constructor(private http: AuthHttp, private fb_auth: AngularFireAuth) {
        let hostname = window.location.hostname;
        if (hostname.endsWith('stackbot.com') || hostname.endsWith('devinci-stackbot.appspot.com')) {
            // Use the production backend when serving from the live site.
            this._backendUrl = 'https://backend-dot-devinci-stackbot.appspot.com';
        }
    }

    getBackendUrl() {
        return this._backendUrl;
    }

    // Extract the JSON data from the response object.
    public request(endpoint: string, data: { [ key: string ]: string; }): Observable<Object> {
        let getParams: string[] = [];
        let requestUrl = this._backendUrl + endpoint;
        Object.keys(data).forEach(function (key) {
            getParams.push(encodeURIComponent(key) + '=' + encodeURIComponent(data[key]));
        });
        if (getParams) {
            requestUrl += '?' + getParams.join('&');
        }

        // Create the Observable, but don't return it just yet. Let's see if the jwt token isn't expired.
        let reqObservable = this.http.get(requestUrl, {withCredentials: true})
            .map(this._extractData)
            .catch(this._handleError);

        // If the jwt token is good to go, then return the request Observable.
        if (tokenNotExpired()) {
            return reqObservable;

        } else {
            // If the token is expired, we need to trigger a new jwt token to be created.
            // If the user is logged in then this SHOULD work.
            let _self = this;
            let token_retries = 0;
            let tokenObs = Observable.create(function (observer: Observer<any>) {

                // First, we need to get the authEvent which has the authEvent.auth.getToken() method we need.
                _self.fb_auth.subscribe(
                    (authEvent: any) => {
                        // getToken(true) seems to trigger another authEvent which we're subscribed to, so seems to cause a
                        // infinite loop. This value keeps things from getting too crazy.
                        if (token_retries > 1) {
                            // Trigger an error that will keep the request from happening.
                            observer.error('Request can\'t be completed because the token is out of date and couldn\'t be updated.');

                            // Check the token again because another request may have updated it already by the time we got here.
                        } else if (! tokenNotExpired()) {
                            // Check the token again because another request may have updated it already by the time we got here.
                            authEvent.auth.getToken(true).then(
                                (token: any) => {
                                    // Increment the retries so they can be limited.
                                    token_retries++;
                                }
                            );
                        } else {
                            // Finally, shut down and let the request proceed.
                            observer.complete();
                        }
                    }
                );
            });

            // Here, we ONLY do the request if the token was refreshed successfully.
            return tokenObs.concat(reqObservable);
        }
    }

    /**
     * Process the returned data that will be handed off to the requesting element.
     */
    private _extractData(res: Response) {
        let body = res.json();
        // Ensure that the response was OK and that the success in the body of the JSON response was true.
        if (!res.ok || !body['success'] === true) {
            console.log('Request to ' +  res.url + ' (query service) failed.');
            throw new Error('Request to ' +  res.url + ' (backend) failed.');
        }
        return body['payload'] || { };
    }

 // Handling the errors in case the GET request above throws an error.
    private _handleError (error: any) {

        // In a real world app, we might use a remote logging infrastructure
        // We'd also dig deeper into the error to get a better message
        let errMsg = (error.message) ? error.message :
            error.status ? `${error.status} - ${error.statusText}` : 'Server error';
        console.error(errMsg); // log to console instead
        return Observable.throw(errMsg);
    }
}
