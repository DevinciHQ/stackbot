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
    private data;
    submit(searchField: string) {
        this.getService.getUrl(searchField)
            .subscribe(
                function(data) { this.data = data},
                function(error) { console.log("Error happened: " + error)},
                function() {
                    if(this.data.success){
                        window.location.href = this.data.payload.redirect;
                    }
                }
            );
    }
}
