
import { Injectable }     from '@angular/core';
import { Http, Response } from '@angular/http';
import { Observable }     from 'rxjs/Observable';
import { AngularFire } from 'angularfire2';
import 'rxjs/add/operator/catch';

@Injectable()
export class QueryService {

    private uid: string = null;
    private backendUrl = 'http://localhost:8081';  // URL to web API

    constructor (private http: Http, private af: AngularFire) {

        // Subscribe to the authentication events of angularfire2 so we can update
        // our local version of the UID when appropriate.
        this.af.auth.subscribe(
            auth => {
                if (auth != null) {
                    this.uid = auth.uid;
                } else {
                    this.uid = null;
                }
            }
        );
    }

    // Save the search query and get the JSON response (which also contains link to redirect) in return.
    public doQuery(query: string) {
        this._backendRequest('/api/q', {q: query }).subscribe(
            data => {
                // If when data is returned from a query with a redirect set, do the redirect.
                if (data['redirect']) {
                    this._redirect(data['redirect']);
                }
            }
        );
    }

    // Extract the JSON data from the response object.
    private _backendRequest(endpoint: string, data: { [ key: string ]: string; }): Observable<Object> {
        let getParams: string[] = [];

        if (this.uid !== undefined) {
            data['uid'] = this.uid;
        }
        let requestUrl = this.backendUrl + endpoint;
        Object.keys(data).forEach(function(key) {
            getParams.push(key + '=' + data[key]);
        });
        if (getParams) {
            requestUrl += '?' + getParams.join('&');
        }

        return this.http.get(requestUrl)
                .map(this._extractData)
                .catch(this._handleError);
    }

    private _redirect(href) {
        window.location = href;
    }

    /**
     * Process the returned data that will be handed off to the requesting element.
     */
    private _extractData(res: Response) {
        let body = res.json();
        // Ensure that the response was OK and that the success in the body of the JSON response was true.
        if (!res.ok || !body['success'] === true) {
            console.log('Request to ' +  res.url + ' (query service) failed.');
            return {};
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
