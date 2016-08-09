/**
 * Created by aashil on 8/9/16.
 */


import { Component } from '@angular/core';
import { Injectable } from '@angular/core';
import { GetService } from "./get.service";

@Component({
    selector: 'search',
    templateUrl: './app/search.component.html',
    providers: [GetService]
    //styleUrls: ['app.component.css']
})

@Injectable()
export class SearchComponent {
    constructor(private getService: GetService){}
    private data: JSON;
    private errorMessage;
    submit(searchField: string) {
        this.getService.getUrl(searchField)
            .subscribe(
                data => this.data = data,
                error =>  this.errorMessage = <any>error);
        console.log(JSON.stringify(this.data));
    }
}
