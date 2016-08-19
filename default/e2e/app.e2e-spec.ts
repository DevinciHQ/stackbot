import { FakePage } from './app.po';

describe('fake App', function() {
  let page: FakePage;

  beforeEach(() => {
    page = new FakePage();
  });

  it('should display message saying app works', () => {
    page.navigateTo();
    expect(page.getParagraphText()).toEqual('app works!');
  });
});
