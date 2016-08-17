/**
 * Created by aashil on 8/17/16.
 */

import { QueryService } from './query.service';
import { Http } from '@angular/http';
import { AngularFire } from 'angularfire2';

describe('QueryService', () => {

    let http: Http;
    let af: AngularFire;
    let queryService: QueryService;
    beforeEach(function() {
        // Frank will figure out how to inject services properly.
        queryService = new QueryService(http, af);
        // TODO: Check to see if the returned value of getUrl is JSON.
        // Link may help: https://github.com/jasmine/jasmine/pull/474
        spyOn(queryService, 'doQuery');
    });

    it('should get the JSON data containing the URL when getURL is called', () => {
        queryService.doQuery('hello');
        expect(queryService.doQuery).toHaveBeenCalled();
    });
});
