import {addProviders, inject } from '@angular/core/testing';
import { ReportComponent } from './index';
import { QueryService } from '../query/index';
import { AuthService} from '../auth/auth.service';
import { Observable, BehaviorSubject, Observer }   from 'rxjs';
import { User } from '../shared/user';

class MockQueryService {

    getQueries() {
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

    login() {
       this.user.next(new User({uid: '123abc', email: 'fake.test@example.com'}));
    }

    logout() {
        this.user.next(null);
    }

    getUser() {
        return this.user;
    }

}

// TODO: This isn't actually testing the component on the webpage, but is calling the items directly.
// TODO: RC5 adds TestBed Class.. see
// TODO: We can use https://developers.livechatinc.com/blog/testing-angular-2-apps-dependency-injection-and-components/
describe('SearchComponent', () => {
    beforeEach(() => {
        addProviders([
            ReportComponent,
            {provide: QueryService, useClass: MockQueryService},
            {provide: AuthService, useClass: MockAuthService}
        ]);
    });
    it('should not call QueryService.getQueries() when user is logged out.',
        inject([ReportComponent, QueryService, AuthService],
            (component: ReportComponent, querySrv: MockQueryService, auth: MockAuthService) => {
            spyOn(querySrv, 'getQueries');
            auth.logout();
            expect(querySrv.getQueries).not.toHaveBeenCalled();
        })
    );

    it('should call QueryService.getQueries() when user is logged in.',
        inject([ReportComponent, QueryService, AuthService],
            (component: ReportComponent, querySrv: MockQueryService, auth: MockAuthService) => {
            spyOn(querySrv, 'getQueries').and.callFake(() => {
                return Observable.create(
                    (observer: Observer<any>) => {
                        observer.next([]);
                        observer.complete();
                    }
                );
            });
            auth.login();
            expect(querySrv.getQueries).toHaveBeenCalled();
        })
    );

    it('should add days QueryService.getQueries() when user is logged in.',
        inject([ReportComponent, QueryService, AuthService],
            (component: ReportComponent, querySrv: QueryService, auth: MockAuthService) => {

            component.setTimezone('America/New_York');

            spyOn(querySrv, 'getQueries').and.callFake(() => {
                return Observable.create(
                    (observer: Observer<any>) => {
                        observer.next([
                            {
                              'query': 'asdfasdf',
                              'timestamp': '2016-09-01T22:04:38.787362'
                            },
                            {
                              'query': 'asdf',
                              'timestamp': '2016-09-01T20:52:51.506263'
                            },
                            {
                              'query': 'asdfasdf',
                              'timestamp': '2016-08-26T21:08:36.131316'
                            },
                            {
                              'query': 'asdfasdf',
                              'timestamp': '2016-08-25T21:43:19.979162'
                            }
                        ]);
                        observer.complete();
                    }
                );
            });

            let accepted_data = [
                {
                    'type' : 'day',
                    'name': 'Thursday',
                    'timestamp': '2016-09-01T23:59:59-04:00'
                },
                {
                    'type' : 'query',
                    'query': 'asdfasdf',
                    'timestamp': '2016-09-01T18:04:38-04:00'
                },
                {
                    'type' : 'query',
                    'query': 'asdf',
                    'timestamp': '2016-09-01T16:52:51-04:00'
                },
                {
                    'type' : 'day',
                    'name': 'Friday',
                    'timestamp': '2016-08-26T23:59:59-04:00'
                },
                {
                    'type' : 'query',
                    'query': 'asdfasdf',
                    'timestamp': '2016-08-26T17:08:36-04:00'
                },
                {
                    'type' : 'day',
                    'name': 'Thursday',
                    'timestamp': '2016-08-25T23:59:59-04:00'
                },
                {
                    'type' : 'query',
                    'query': 'asdfasdf',
                    'timestamp': '2016-08-25T17:43:19-04:00'
                }
            ];

            auth.login();
            expect(component.data.length).toEqual(7);
            for (let i = 0; i < component.data.length; i++) {
                // console.log(component.data[i]);
                component.data[i].timestamp =  component.data[i].timestamp.format();
                expect(component.data[i]).toEqual(accepted_data[i]);

            }
            expect(component.data).toEqual(accepted_data);
        })
    );
});
