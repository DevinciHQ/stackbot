
import { Component } from '@angular/core';
import { QueryService } from '../query/index';
import { FocusMeDirective } from '../shared/focus-me.directive';

@Component({
    moduleId: module.id,
    selector: 'search',
    templateUrl: 'search.component.html',
    providers: [QueryService],
    directives: [FocusMeDirective]
})
export class SearchComponent {

    private preSearchText: any;
    constructor(private queryService: QueryService) {
        this.preSearchText = this.populateSearch(window.location.href);
    }

    submit(searchField: string) {
        if (searchField !== '') {
          this.doSearch(searchField)  ;
        }
    }

    onPressEnter(e: any, searchField: any) {
        if (e.keyCode === 13 && searchField !== '') {
            this.doSearch(searchField);
        }
    }

    doSearch(searchField: any) {
        this.queryService.doQuery(searchField).subscribe(
            data => {
                // If when data is returned from a query with a redirect set, do the redirect.
                if (data['redirect']) {
                    this._redirect(data['redirect']);
                }
            }
        );
    }

    populateSearch(href: any): string {
        let parameters = this.parseURLParams(href);
        return parameters['q'] || null;
    }

    parseURLParams(url: any) {
        let getParams = {};
        // Split the url into two parts before and after the '?'
        let urlParts = url.split('?');
        if (urlParts.length === 2) {
            // Split the GET params into parts.
            let parameters = urlParts[1].split('&');
            // For each part, decode the key name and the value and add them to the output.
            for (let i = 0; i < parameters.length; i++) {
                let paramParts = parameters[i].split('=');
                // Replace '+' with spaces '%20' because the decodeURIComponent doesn't do it.
                getParams[decodeURIComponent(paramParts[0].replace(/\+/g, '%20'))] =
                    decodeURIComponent(paramParts[1].replace(/\+/g, '%20'));
            }
        }
        return getParams;
    }

    private _redirect(href: any) {
        // window.location = href;
    }
}
