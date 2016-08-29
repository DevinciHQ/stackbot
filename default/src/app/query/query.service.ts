
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
    public getQueries(): Observable<Object> {
        return this.backend.request('/api/report', {});
    };
}
