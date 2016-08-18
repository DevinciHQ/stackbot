
import {BaseRequestOptions, Response, ResponseOptions, Http} from '@angular/http';
import {addProviders, inject, async} from '@angular/core/testing';
import { QueryService } from './query.service';
import { AngularFireAuth, FirebaseAuthState, FIREBASE_PROVIDERS} from 'angularfire2';
import { MockBackend, MockConnection} from '@angular/http/testing';

class AuthBackend extends MockBackend {

}


class MockAngularFireAuth {

  public login(): any {
      // jasmine.crea
     // new Promise();
  }
  public logout() {
  }

    public subscribe() {
    }
}

describe('QueryService', () => {
    beforeEach(() => {
        addProviders([
            QueryService,
            MockBackend,
            BaseRequestOptions,
            {provide: AngularFireAuth , useClass: MockAngularFireAuth},
            {provide: Http, useFactory: (backend, options) => {
              return new Http(backend, options);
            }, deps: [MockBackend, BaseRequestOptions]},
        ]);
    });

    it('should get some data', inject([QueryService], (queryService: QueryService) => {

    }));

    /*it('should get the JSON data containing the URL when getURL is called',
        inject([QueryService, Http, AngularFire], (queryService: QueryService, af: AngularFire) => {
            spyOn(queryService, 'doQuery');
            queryService.doQuery('hello');
            expect(queryService.doQuery).toHaveBeenCalled();
        })
    );*/
});
