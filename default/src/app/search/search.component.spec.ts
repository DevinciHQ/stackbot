import {addProviders, inject } from '@angular/core/testing';
import { SearchComponent } from './index';
import { QueryService } from '../query/index';
import { AuthService} from '../auth/auth.service';
import { Observable, BehaviorSubject, Observer }   from 'rxjs';
import { User } from '../shared/user';
import { GoogleAnalyticsService } from '../shared/google.analytics.service';

class MockQueryService {

    doQuery(path: string, data: any) {
        return Observable.create(
            (observer: any) => {
                // observer.next(new RequestParams(path, data));
                observer.next(null);
                // observer.complete();
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

class MockGoogleAnalyticsService {
    event(eventCategory: string, eventAction: string, eventLabel: string) {
    }
    setUserId(userId: string) {
    }
    unsetUserId() {
    }
}

// TODO: This isn't actually testing the component on the webpage, but is calling the items directly.
// TODO: RC5 adds TestBed Class.. see
// TODO: We can use https://developers.livechatinc.com/blog/testing-angular-2-apps-dependency-injection-and-components/
describe('SearchComponent', () => {
    beforeEach(() => {
        addProviders([
            SearchComponent,
            {provide: QueryService, useClass: MockQueryService},
            {provide: AuthService, useClass: MockAuthService},
            {provide: GoogleAnalyticsService, useClass: MockGoogleAnalyticsService}
        ]);
    });
    it('submit button should NOT send a query if search field is empty',
        inject([SearchComponent, QueryService], (component: SearchComponent, querySrv: MockQueryService) => {
            spyOn(querySrv, 'doQuery');
            component.submit('');
            expect(querySrv.doQuery).not.toHaveBeenCalled();
        })
    );
    // it('submit button should send a query if search field is not empty',
    //     inject([SearchComponent, QueryService], (component: SearchComponent, querySrv: MockQueryService) => {
    //         spyOn(querySrv, 'doQuery');
    //         component.submit('some search');
    //         expect(querySrv.doQuery).toHaveBeenCalledWith('some search');
    //     })
    // );

    it('the parseURLParameters function should return a dictionary of parameters and their values.',
        inject([SearchComponent], (component: SearchComponent) => {
            let value = component.parseURLParams('http://localhost:8080/?q=!%23%26*%25%40%5E+%2B&with+space=also+works+fine');
            expect(value['q']).toBe('!#&*%@^ +');
             expect(value['with space']).toBe('also works fine');
        })
    );

    it('populateSearch function should return the decoded value of the q parameter',
        inject([SearchComponent], (component: SearchComponent) => {
            let value = component.populateSearch('http://localhost:8080/?q=some+search+stuff');
            expect(value).toBe('some search stuff');
        })
    );

    it('anonymous should be able to search and then get redirected.',
        inject([SearchComponent, QueryService, AuthService], (component: SearchComponent, querySrv: MockQueryService,
                                                              auth: MockAuthService) => {
            spyOn(querySrv, 'doQuery').and.callFake(() => {
                return Observable.create(
                    (observer: Observer<any>) => {
                        observer.next({
                               'success': 'true',
                               'payload': {
                                    'redirect': 'http://google.com/q#=whatever',
                                },
                               'cursor': null
                        });
                        observer.complete();
                    }
                );
            });

            // We can get around private method issues like this.
            let redirect = spyOn(component, '_redirect');
            auth.logout();
            component.submit('whatever');
            expect(querySrv.doQuery).toHaveBeenCalled();
            expect(redirect).toHaveBeenCalledWith('http://google.com/q#=whatever');
        })

    );

    it('should record the GA event for submit button on clicking it or pressing enter key',
        inject([SearchComponent, GoogleAnalyticsService], (component: SearchComponent,
                                                           ga: MockGoogleAnalyticsService
        ) => {
            spyOn(component, 'doSearch').and.callFake(() => {
                return Observable.create(
                    (observer: Observer<any>) => {
                        observer.next({
                               'success': 'true',
                               'payload': {
                                    'redirect': 'http://google.com/q#=whatever',
                                },
                               'cursor': null
                        });
                        observer.complete();
                    }
                );
            });
            spyOn(ga, 'event');
            component.submit('whatever');
            expect(ga.event).toHaveBeenCalledWith('Search', 'submit', 'clicking submit button');
            component.onPressEnter({'keyCode' : 13}, 'whatever');
            expect(ga.event).toHaveBeenCalledWith('Search', 'submit', 'pressing enter');
        })
    );

    it('should record the GA event for source',
        inject([SearchComponent, QueryService, GoogleAnalyticsService], (component: SearchComponent,
                                                                         querySrv: MockQueryService,
                                                                         ga: MockGoogleAnalyticsService
        ) => {
            spyOn(querySrv, 'doQuery').and.callFake(() => {
                return Observable.create(
                    (observer: Observer<any>) => {
                        observer.next({
                               'success': 'true',
                               'payload': {
                                    'redirect': 'http://google.com/q#=whatever',
                                },
                               'cursor': null
                        });
                        observer.complete();
                    }
                );
            });
            spyOn(ga, 'event');
            component.doSearch('whatever');
            expect(ga.event).toHaveBeenCalledWith('Search', 'source', 'site-search');
            component.recordOmniSearch('http://localhost:8080/?q=hello');
            expect(ga.event).toHaveBeenCalledWith('Search', 'source', 'omnibox');
        })
    );
});
