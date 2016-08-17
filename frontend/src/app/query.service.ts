/**
 * Created by aashil on 8/10/16.
 */

import { Injectable }     from '@angular/core';
import { Http, Response } from '@angular/http';
import { Observable }     from 'rxjs/Observable';
import 'rxjs/add/operator/catch';

@Injectable()
export class QueryService {

    private backendUrl = 'http://localhost:8081/api/q?q=';  // URL to web API
    constructor (private http: Http) {}
    // Save the search query and get the JSON response (which also contains link to redirect) in return.
    getUrl (searchField: String, uid: String): Observable<JSON> {
        if (uid !== undefined) {
            return this.http.get(this.backendUrl + searchField + '&uid=' + uid)
                .map(this.extractData)
                .catch(this.handleError);
        } else {
            return this.http.get(this.backendUrl + searchField)
                .map(this.extractData)
                .catch(this.handleError);
        }
    }
    // Extract the JSON data from the response object.
    private extractData(res: Response) {
        let body = res.json();
        return body || { };
    }
    // Handling the errors in case the GET request above throws an error.
    private handleError (error: any) {
        // In a real world app, we might use a remote logging infrastructure
        // We'd also dig deeper into the error to get a better message
        let errMsg = (error.message) ? error.message :
            error.status ? `${error.status} - ${error.statusText}` : 'Server error';
        console.error(errMsg); // log to console instead
        return Observable.throw(errMsg);
    }
}