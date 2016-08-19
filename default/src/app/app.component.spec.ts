/* tslint:disable:no-unused-variable */

import { addProviders, async, inject } from '@angular/core/testing';
import { AppComponent } from './app.component';
import { AngularFireAuth } from 'angularfire2';
import { SearchComponent } from './search.component';

class MockSearchComponent {
  public mockName: string = 'Mocked Service';
}

class MockAngularFireAuth {

    public login(): any {
    }

    public logout() {
    }

    public subscribe() {
    }
}

describe('App: Stackbot', () => {
  beforeEach(() => {
    addProviders([
      AppComponent,
      {provide: AngularFireAuth, useClass: MockAngularFireAuth},
      {provide: SearchComponent, useClass: MockSearchComponent}
    ]);
  });

  it('should create the app',
    inject([AppComponent], (app: AppComponent) => {
      expect(app).toBeTruthy();
    }));
});
