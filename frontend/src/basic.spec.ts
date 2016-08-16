/**
 * Created by aashil on 8/15/16.
 */
import { SearchComponent } from './app/search.component'
import { GetService } from './app/get.service'
import { RedirectService } from './app/redirect.service'


describe('1st tests', () => {
    it('true is true', () => expect(true).toEqual(true));
    it('null is not the same thing as undefined',
        () => expect(null).not.toEqual(undefined)
    );
});

/*
describe('Submit', () => {
    let searchComponent: SearchComponent;
    beforeEach(() => {
        searchComponent = new SearchComponent(new GetService, new RedirectService);
    });
    spyOn(this.searchComponent, "submit");
    it("Submit method has been called",
        () => expect(searchComponent.submit("hello")).toHaveBeenCalled()
    );
});
*/

/*
describe('Service: LanguagesService', () => {
    beforeEachProviders(() => [LanguagesService]);

    it('contains English', inject([SearchComponent], (search) => {
        expect(search.submit());
    }));
})*/


describe('redirect', () => {
    let redirectService: RedirectService;
    beforeEach(() => {
        redirectService = new RedirectService();
    });
    spyOn(redirectService, "redirect");
    it("redirect method has been called",
        () => expect(redirectService.redirect("whatever")).toHaveBeenCalled()
    );
});