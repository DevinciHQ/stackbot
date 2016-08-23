
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

    preSearchText = null;
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

    populateSearch(href) {
        let parameters = this.parseURL(window.location.href);
       /* if (href.split('?q=').length === 2) {
            // First split on question mark, then on &, then for each split on =, then find "q" item, then decode that value.
            return decodeURIComponent(href.split('?q=')[1]).replace('+', ' ');
        }*/
        for (let i = 0; i < parameters.length; i++) {
            console.log(parameters[i]);
            if (parameters[i] === 'q') {

            }
        }
    }

    parseURL(url) {
        let dict = {};
        if (url.split('?').length === 2) {
            let parameters = url.split('?')[1].split('&');
            for (let i = 0; i < parameters.length; i++) {
                dict[parameters[i].split('=')[0]] = parameters[i].split('=')[1];
            }
        }
        return dict;
    }

    private _redirect(href) {
        window.location = href;
    }
}
