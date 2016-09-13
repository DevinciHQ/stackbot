
import { Injectable }     from '@angular/core';
import { Observable }     from 'rxjs/Observable';
import 'rxjs/add/operator/catch';
import {BackendService} from '../shared/backend.service';
import {AuthService} from '../auth/auth.service';

@Injectable()
export class QueryService {
    constructor(private backend: BackendService, private auth: AuthService) {}

    /**
     *
     * @param query
     * @param source
     * @returns {Observable<Object>}
     */
    public doQuery(query: string, source: string): Observable<Object> {
        let user = this.auth.getUser().getValue();
        let use_auth: boolean;

        // Send an authenticated request if the user is logged in.
        if (user && user.loggedIn) {
            use_auth = true;
        } else if (user && !user.loggedIn) {
            // Send an un-authenticated request if the user is logged out.
            use_auth = false;
        } else {
            // If the user is still pending (null), then don't do anything yet.
            console.log('Not making any request until the user\'s loggedIn status is resolved.');
            return;
        }
        // Save the search query and get the JSON response (which also contains link to redirect) in return.
        return this.backend.request('/api/q', {q: query, source: source }, use_auth);
    }

    // Get the search history as a JSON response.
    // This function takes a cursor parameter and makes a backend request by passing it as a GET param.
    // This is done to get more data on pressing the "Show more" button.
    public getQueries(cursor?: any): Observable<Object> {
        if (cursor) {
            return this.backend.request('/api/report', {cursor: cursor, limit: '100'});
        } else {
            return this.backend.request('/api/report', {limit: '100'});
        }
    };
}
