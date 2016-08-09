/**
 * Created by aashil on 8/9/16.
 */


import { Component } from '@angular/core';

@Component({
    selector: 'search',
    templateUrl: './app/search.component.html',
    //styleUrls: ['app.component.css']
})

export class SearchComponent {
    search = '';
    submit(searchField: string) {
        this.search = searchField;
    }

}
