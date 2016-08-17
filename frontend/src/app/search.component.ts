
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
            this.queryService.doQuery(searchField);
        }
    }

    onPressEnter(e, searchField) {
        if (e.keyCode === 13 && searchField !== '') {
            this.queryService.doQuery(searchField);
        }
    }
}
