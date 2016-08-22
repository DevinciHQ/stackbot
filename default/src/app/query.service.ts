
import { Injectable }     from '@angular/core';
import { Response } from '@angular/http';
import { Observable }     from 'rxjs/Observable';
import 'rxjs/add/operator/catch';
import { AuthHttp } from 'angular2-jwt';

@Injectable()
export class QueryService {
    private backendUrl: string = 'http://localhost:8081';

    constructor(private http: AuthHttp) {
        if (window.location.hostname.endsWith('stackbot.com')) {
            // Use the production backend when serving from the live site.
            this.backendUrl = 'backend-devinci-stackbot.appspot.com';
        }
    }

    // Save the search query and get the JSON response (which also contains link to redirect) in return.

    /**
     *
     * @param query
     * @returns {Observable<Object>}
     */
    public doQuery(query: string): Observable<Object> {
        return this._backendRequest('/api/q', {q: query });
    }

    // Get the search history as a JSON response.
    public getQueries() {
        return this._backendRequest('/api/report', {});
    };

    // Extract the JSON data from the response object.
    private _backendRequest(endpoint: string, data: { [ key: string ]: string; }): Observable<Object> {

        let getParams: string[] = [];
        let requestUrl = this.backendUrl + endpoint;
        Object.keys(data).forEach(function(key) {
            getParams.push(encodeURIComponent(key) + '=' + encodeURIComponent(data[key]));
        });
        if (getParams) {
            requestUrl += '?' + getParams.join('&');
        }
        return this.http.get(requestUrl)
                .map(this._extractData)
                .catch(this._handleError);
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
