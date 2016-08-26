
import {
  inject,
  addProviders,
  async
} from '@angular/core/testing';
import { HTTP_PROVIDERS, ConnectionBackend, BaseRequestOptions, XHRBackend, Response, ResponseOptions, Http} from '@angular/http';
import { MockBackend, MockConnection} from '@angular/http/testing';
import { QueryService } from './query.service';
import { AuthHttp } from 'angular2-jwt';

class AuthBackend extends MockBackend {

}

describe('QueryService', () => {
    beforeEach(() => {
        addProviders([
            QueryService,
            MockBackend,
            BaseRequestOptions,
            HTTP_PROVIDERS,
            // This is how you can Mock the backend of Http so that you can actually intercept and provide your own
            // custom responses. See examples below.. This took hours to figure out as there isn't great documentation.
            // addProviders, async, and inject were all added in angular RC4 (alternatives existed earlier).
            {provide: AuthHttp, useClass: Http},
            {provide: XHRBackend, useClass: MockBackend},
            {provide: ConnectionBackend, useClass: MockBackend}
        ]);
    });

    it('should get back a redirect when sending a query', async(inject(
                // Note that we pass XHRBackend, NOT MockBackend.
                [QueryService, XHRBackend], (queryService: QueryService, backend: MockBackend) => {
        const mockedResponse = new ResponseOptions({
            body: '{"success": true, "payload": {"redirect": "http://google.com/#q=asdf"}}',
            status: 200
        });

        backend.connections.subscribe((connection: MockConnection) => {
            let url = connection.request.url.split('?')[0];
            if (url.endsWith('api/q')) {
                connection.mockRespond(new Response(mockedResponse));

            }
        });

        // Ensure that doQuery gets back a redirect.
        queryService.doQuery('asdf', 'test').subscribe( data => {
                expect(data).toEqual({'redirect': 'http://google.com/#q=asdf'});
            },
            err => {
                throw new Error('Query failed');
            }

        );

    })));


    it('should urlencode data when sending a query', async(inject(
                // Note that we pass XHRBackend, NOT MockBackend.
                [QueryService, XHRBackend], (queryService: QueryService, backend: MockBackend) => {

        backend.connections.subscribe((connection: MockConnection) => {
            let getParam = connection.request.url.split('?')[1];
            expect(getParam).toEqual('q=%26%2B%3D%23%22%20_!a1');
        });

        // Ensure that doQuery gets back a redirect.
        queryService.doQuery('&+=#" _!a1', 'test');

    })));
});
