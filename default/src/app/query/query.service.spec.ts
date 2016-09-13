
import {
  inject,
  addProviders,
  async,
} from '@angular/core/testing';
import { QueryService } from './query.service';
import { BackendService} from '../shared/backend.service';
import { Observable, Observer, BehaviorSubject } from 'rxjs';
import { User } from '../shared/user';
import { AuthService } from '../auth/auth.service';


class MockBackendService {

    request(path: string, data: any, use_auth: boolean) {
        return Observable.create(
            (observer: Observer<any>) => {
                observer.next(null);
                observer.complete();
            }
        );
    }
}

class MockAuthService {

   private user = new BehaviorSubject<User>(null);
    // Observable string streams
    // user$ = this.user.asObservable();

    login() {
       this.user.next(new User(new User({uid: '123abc', email: 'fake.test@example.com', loggedIn: true})));
    }

    logout() {
        this.user.next(new User);
    }

    getUser() {
        return this.user;
    }

}

describe('QueryService', () => {
    beforeEach(() => {
        addProviders([
            QueryService,
            {provide: AuthService, useClass: MockAuthService},
            {provide: BackendService, useClass: MockBackendService}
        ]);
    });

    it('should call backend path with query, source and authentication as data.', async(inject(
        // Note that we pass XHRBackend, NOT MockBackend.
        [QueryService, AuthService, BackendService], (queryService: QueryService, auth: MockAuthService, backend: MockBackendService) => {

            let query = 'asdf';
            let source = 'test';

            spyOn(backend, 'request').and.callThrough();

            auth.login();
            queryService.doQuery('asdf', 'test').subscribe(data => {
                expect(backend.request).toHaveBeenCalledWith('/api/q', {q: query, source: source}, true);
                },
                err => {
                    throw new Error('Query failed');
                }
            );

        }
    )));
    it('should use an un-authenticated request if the user is logged out.', async(inject(
        // Note that we pass XHRBackend, NOT MockBackend.
        [QueryService, AuthService, BackendService], (queryService: QueryService, auth: MockAuthService, backend: MockBackendService) => {

            let query = 'asdf';
            let source = 'test';

            spyOn(backend, 'request').and.callThrough();
            auth.logout();

            queryService.doQuery('asdf', 'test').subscribe(data => {
                expect(backend.request).toHaveBeenCalledWith('/api/q', {q: query, source: source}, false);
                },
                err => {
                    throw new Error('Query failed');
                }
            );

        }
    )));
    it('should use an authenticated request if the user is logged in.', async(inject(
        // Note that we pass XHRBackend, NOT MockBackend.
        [QueryService, AuthService, BackendService], (queryService: QueryService, auth: MockAuthService, backend: MockBackendService) => {

            let query = 'asdf';
            let source = 'test';

            spyOn(backend, 'request').and.callThrough();
            auth.login();

            queryService.doQuery('asdf', 'test').subscribe(data => {
                expect(backend.request).toHaveBeenCalledWith('/api/q', {q: query, source: source}, true);
                },
                err => {
                    throw new Error('Query failed');
                }
            );

        }
    )));
    it('should not make any request if the user is null.', async(inject(
        // Note that we pass XHRBackend, NOT MockBackend.
        [QueryService, AuthService, BackendService], (queryService: QueryService, auth: MockAuthService, backend: MockBackendService) => {

            spyOn(backend, 'request').and.callThrough();

            // We don't login or logout, so the user should be null.

            queryService.doQuery('asdf', 'test').subscribe(data => {
                expect(backend.request).not.toHaveBeenCalled();
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
                        expect(backend.request).toHaveBeenCalledWith('/api/report', {limit: '100'});
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
