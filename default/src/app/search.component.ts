
import { Component } from '@angular/core';
import { Injectable } from '@angular/core';
import { QueryService } from './query.service';

@Component({
    selector: 'search',
    templateUrl: './app/search.component.html',
    providers: [QueryService]
    // styleUrls: ['app.component.css']
})

@Injectable()
export class SearchComponent {

    preSearchText;
    constructor(private queryService: QueryService) {
        this.preSearchText = this.populateSearch(window.location.href);
    }

    submit(searchField: string) {
        if (searchField !== '') {
          this.doSearch(searchField)  ;
        }
    }

    onPressEnter(e, searchField) {
        if (e.keyCode === 13 && searchField !== '') {
            this.doSearch(searchField);
        }
    }

    doSearch(searchField) {
        this.queryService.doQuery(searchField).subscribe(
            data => {
                // If when data is returned from a query with a redirect set, do the redirect.
                if (data['redirect']) {
                    this._redirect(data['redirect']);
                }
            }
        );
    }

    populateSearch(href): string {
        let parameters = this.parseURLParams(window.location.href);
       /* if (href.split('?q=').length === 2) {
            // First split on question mark, then on &, then for each split on =, then find "q" item, then decode that value.
            return decodeURIComponent(href.split('?q=')[1]).replace('+', ' ');
        }*/

        return parameters['q'] || null;
    }

    parseURLParams(url) {
        let getParams = {};
        // Split the url into two parts before and after the '?'
        let urlParts = url.split('?');
        if (urlParts.length === 2) {
            // Split the GET params into parts.
            let parameters = urlParts[1].split('&');
            // For each part, decode the key name and the value and add them to the output.
            for (let i = 0; i < parameters.length; i++) {
                let paramParts = parameters[i].split('=');
                getParams[decodeURIComponent(paramParts[0])] = decodeURIComponent(paramParts[1]);
            }
        }
        return getParams;
    }

    private _redirect(href) {
        window.location = href;
    }
}
