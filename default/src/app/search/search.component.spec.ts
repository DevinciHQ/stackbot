import {addProviders, inject } from '@angular/core/testing';
import { SearchComponent } from './index';
import { QueryService } from '../query/index';
import {AuthService} from '../auth/auth.service';
import { Subject }    from 'rxjs/Subject';

class MockQueryService {

    public doQuery(query: any) {
        // This isn't working!!!!!!!!
        // let source = Observer
        // return source;

        // return Rx. Observable.create(observer => {
        //     // Yield a single value and complete
        //     observer.onNext(42);
        //     observer.onCompleted();
        //     // Any cleanup logic might go here
        //     return () => console.log('disposed');
        // });
    }
}

class MockAuthService {

   private token = new Subject<string>();

    // Observable string streams
    // user$ = this.user.asObservable();
    tokenEvent$ = this.token.asObservable();

    login() {
    }

    logout() {

    }

    authEvent() {
        return this.tokenEvent$;
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
            {provide: AuthService, useClass: MockAuthService}
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
});
