
import { RedirectService } from './redirect.service';

describe('RedirectService', () => {

    let redirectService: RedirectService;
    let location = '';

    beforeEach(function() {
        redirectService = new RedirectService();
        // Overwrite the redirect method so it doesn't actually redirect anywhere.
        // Now that we know this is possible with spies, perhaps this whole Service is unnecessary?
        spyOn(redirectService, 'redirect').and.callFake(function(href) {
            // console.log(href);
            location = href;
        });
    });

    it('should have method redirect', () => {
        expect(typeof(redirectService.redirect)).toBe('function');
    });
    it('should redirect the browser when redirect is called', () => {
        redirectService.redirect('http://google.com');
        expect(redirectService.redirect).toHaveBeenCalled();
        expect(location).toBe('http://google.com');
    });
});
