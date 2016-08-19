/* tslint:disable:no-unused-variable */

import { addProviders, async, inject } from '@angular/core/testing';
import { AppComponent } from './app.component';
import { AngularFire } from 'angularfire2';
import { SearchComponent } from './search.component';

class MockSearchComponent {
  public mockName: string = 'Mocked Service';
}
class MockAngularFire {
  public mockName: string = 'Mocked Service';
}

describe('App: Stackbot', () => {
  beforeEach(() => {
    addProviders([
      AppComponent,
      {provide: AngularFire, useClass: MockAngularFire},
      {provide: SearchComponent, useClass: MockSearchComponent}
    ]);
  });

  it('should create the app',
    inject([AppComponent], (app: AppComponent, af: MockAngularFire) => {
      expect(app).toBeTruthy();
    }));
});
