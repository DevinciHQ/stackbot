
import {
  inject,
  addProviders,
  async,
} from '@angular/core/testing';
import { QueryService } from './query.service';
import { BackendService} from '../shared/backend.service';
import { Observable, Observer } from 'rxjs';


class MockBackendService {

    request(path: string, data: any) {
        return Observable.create(
            (observer: Observer<any>) => {
                observer.next(null);
                observer.complete();
            }
        );
    }
}

describe('QueryService', () => {
    beforeEach(() => {
        addProviders([
            QueryService,
            {provide: BackendService, useClass: MockBackendService}
        ]);
    });

    it('should call backend path with query and source as data.', async(inject(
        // Note that we pass XHRBackend, NOT MockBackend.
        [QueryService, BackendService], (queryService: QueryService, backend: MockBackendService) => {

            let query = 'asdf';
            let source = 'test';

            spyOn(backend, 'request').and.callThrough();

            queryService.doQuery('asdf', 'test').subscribe(data => {
                expect(backend.request).toHaveBeenCalledWith('/api/q', {q: query, source: source});
                },
                err => {
                    throw new Error('Query failed');
                }
            );

        }
    )));
    describe('getQueries()', () => {

        it('should call backend.request() just the /api/report path and an empty object.', async(inject(
            // Note that we pass XHRBackend, NOT MockBackend.
            [QueryService, BackendService], (queryService: QueryService, backend: MockBackendService) => {

                spyOn(backend, 'request').and.callThrough();

                queryService.getQueries().subscribe(data => {
                        expect(backend.request).toHaveBeenCalledWith('/api/report', {});
                    },
                    err => {
                        throw new Error('Query failed');
                    }
                );

            }
        )));
    });
});


//     it('should urlencode data when sending a query', async(inject(
//                 // Note that we pass XHRBackend, NOT MockBackend.
//                 [QueryService, XHRBackend], (queryService: QueryService, backend: MockBackend) => {
//
//         backend.connections.subscribe((connection: MockConnection) => {
//             let getParam = connection.request.url.split('?')[1];
//             expect(getParam).toEqual('q=%26%2B%3D%23%22%20_!a1');
//         });
//
//         // Ensure that doQuery gets back a redirect.
//         queryService.doQuery('&+=#" _!a1', 'test');
//
//     })));
// });
