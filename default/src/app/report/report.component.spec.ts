import {addProviders, inject } from '@angular/core/testing';
import { ReportComponent } from './index';
import { QueryService } from '../query/index';
import { AuthService} from '../auth/auth.service';
import { Observable, BehaviorSubject, Observer }   from 'rxjs';
import { User } from '../shared/user';
// Note that this also imports moment itself.
import * as moment from 'moment-timezone';

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

    it('should format the month.',
        inject([ReportComponent, QueryService, AuthService],
            (component: ReportComponent, querySrv: QueryService, auth: MockAuthService) => {
                component.setTimezone('America/Phoenix');
                let date = moment('2016-09-01T23:59:59-07:00');
                let month = component.formatMonth(date);
                expect(month).toEqual('Sep');
            }
        )
    );

    it('should format the time.',
        inject([ReportComponent, QueryService, AuthService],
            (component: ReportComponent, querySrv: QueryService, auth: MockAuthService) => {
                component.setTimezone('America/Phoenix');
                let date = moment('2016-09-01T23:59:59-07:00');
                let time = component.formatTime(date);
                expect(time).toEqual('11:59 PM');
            }
        )
    );

    it('should format the day of the month.',
        inject([ReportComponent, QueryService, AuthService],
            (component: ReportComponent, querySrv: QueryService, auth: MockAuthService) => {
                component.setTimezone('America/Phoenix');
                let date = moment('2016-09-01T23:59:59-07:00');
                let day = component.formatDayOfMonth(date);
                expect(day).toEqual('1');
            }
        )
    );


    it('should add days QueryService.getQueries() when user is logged in.',
        inject([ReportComponent, QueryService, AuthService],
            (component: ReportComponent, querySrv: QueryService, auth: MockAuthService) => {

            component.setTimezone('America/Phoenix');

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
                    'timestamp': '2016-09-01T23:59:59-07:00'
                },
                {
                    'type' : 'query',
                    'query': 'asdfasdf',
                    'timestamp': '2016-09-01T15:04:38-07:00',
                    'tags': <string[]>[],
                },
                {
                    'type' : 'query',
                    'query': 'asdf',
                    'timestamp': '2016-09-01T13:52:51-07:00',
                    'tags': <string[]>[],
                },
                {
                    'type' : 'day',
                    'name': 'Friday',
                    'timestamp': '2016-08-26T23:59:59-07:00'
                },
                {
                    'type' : 'query',
                    'query': 'asdfasdf',
                    'timestamp': '2016-08-26T14:08:36-07:00',
                    'tags': <string[]>[],
                },
                {
                    'type' : 'day',
                    'name': 'Thursday',
                    'timestamp': '2016-08-25T23:59:59-07:00'
                },
                {
                    'type' : 'query',
                    'query': 'asdfasdf',
                    'timestamp': '2016-08-25T14:43:19-07:00',
                    'tags': <string[]>[],
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

    it('should display tags after the query in the reports',
        inject([ReportComponent, QueryService, AuthService],
            (component: ReportComponent, querySrv: QueryService, auth: MockAuthService) => {
            component.setTimezone('America/Phoenix');

            spyOn(querySrv, 'getQueries').and.callFake(() => {
                return Observable.create(
                    (observer: Observer<any>) => {
                        observer.next([
                            {
                              'query': 'asdfasdf',
                              'tags': ['fake-tag'],
                              'timestamp': '2016-09-01T22:04:38.787362'
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
                    'timestamp': '2016-09-01T23:59:59-07:00'
                },
                {
                    'type' : 'query',
                    'query': 'asdfasdf',
                    'tags' : ['fake-tag'],
                    'timestamp': '2016-09-01T15:04:38-07:00'
                },
            ];

            auth.login();
            expect(component.data.length).toEqual(2);
            for (let i = 0; i < component.data.length; i++) {
                // console.log(component.data[i]);
                component.data[i].timestamp =  component.data[i].timestamp.format();
                expect(component.data[i]).toEqual(accepted_data[i]);

            }
            expect(component.data).toEqual(accepted_data);
        })
    );
    describe('Add More', () => {
        // it('should display a "more" button at the bottom of the report.', inject([ReportComponent, QueryService, AuthService],
        //     (component: ReportComponent, querySrv: QueryService, auth: MockAuthService) => {
        // }));
        it('should add items to the list when the more button is clicked. ',
            inject([ReportComponent, QueryService, AuthService],
                (component: ReportComponent, querySrv: QueryService, auth: MockAuthService) => {

                    spyOn(querySrv, 'getQueries').and.callFake(() => {
                        return Observable.create(
                            (observer: Observer<any>) => {
                                observer.next({
                                    'cursor': 'fake',
                                    'payload': [
                                        {
                                            'query': 'asdfasdf',
                                            'tags': ['fake-tag'],
                                            'timestamp': '2016-09-01T22:04:38.787362'
                                        }
                                    ]
                                });
                                observer.complete();
                            }
                        );
                    });

                    expect(component.data.length = 1);
                    component.getMoreData('cursor_coming_through');
                    expect(component.data.length = 2);
                }
            )
        );
    });
});
