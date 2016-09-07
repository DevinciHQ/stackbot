
import { Injectable }     from '@angular/core';
import { Observable }     from 'rxjs/Observable';
import 'rxjs/add/operator/catch';
import {BackendService} from '../shared/backend.service';

@Injectable()
export class QueryService {
    constructor(private backend: BackendService) {}

    /**
     *
     * @param query
     * @returns {Observable<Object>}
     */
    public doQuery(query: string, source: string): Observable<Object> {
        // Save the search query and get the JSON response (which also contains link to redirect) in return.
        return this.backend.request('/api/q', {q: query, source: source });
    }

    // Get the search history as a JSON response.
    // This function takes a cursor parameter and makes a backend request by passing it as a GET param.
    // This is done to get more data on pressing the "Show more" button.
    public getQueries(cursor?: any): Observable<Object> {
        if (cursor) {
            return this.backend.request('/api/report', {cursor: cursor});
        } else {
            return this.backend.request('/api/report', {});
        }
    };
}
