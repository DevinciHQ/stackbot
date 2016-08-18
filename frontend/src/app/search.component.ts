
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

    constructor(private queryService: QueryService) {}

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

    private _redirect(href) {
        window.location = href;
    }
}
