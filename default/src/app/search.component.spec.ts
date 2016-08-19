import {addProviders, inject } from '@angular/core/testing';
import { SearchComponent, QueryService } from './';

class MockQueryService {

    public doQuery(query) {}
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
        inject([SearchComponent, QueryService], (component: SearchComponent, querySrv: QueryService) => {
            spyOn(querySrv, 'doQuery');
            component.submit('');
            expect(querySrv.doQuery).not.toHaveBeenCalled();
        })
    );
    /*it('submit button should send a query if search field is not empty',
        inject([SearchComponent, QueryService], (component: SearchComponent, querySrv: QueryService) => {
            spyOn(querySrv, 'doQuery');
            component.submit('some search');
            expect(querySrv.doQuery).toHaveBeenCalledWith('some search');
        })
    );*/
});
