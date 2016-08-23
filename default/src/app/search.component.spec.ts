import {addProviders, inject } from '@angular/core/testing';
import { SearchComponent, QueryService } from './';

class MockQueryService {

    public doQuery(query) {
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

// TODO: This isn't actually testing the component on the webpage, but is calling the items directly.
// TODO: RC5 adds TestBed Class.. see
// TODO: We can use https://developers.livechatinc.com/blog/testing-angular-2-apps-dependency-injection-and-components/
describe('SearchComponent', () => {
    beforeEach(() => {
        addProviders([
            SearchComponent,
            {provide: QueryService, useClass: MockQueryService},
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

    it('submit button should NOT send a query if search field is empty',
        inject([SearchComponent], (component: SearchComponent) => {
            component.populateSearch('asdf');
            expect(component.preSearchText).toBe('asdf');
        })
    );
});
