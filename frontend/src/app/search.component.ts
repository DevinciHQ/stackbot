/**
 * Created by aashil on 8/9/16.
 */


import { Component } from '@angular/core';
import { Injectable } from '@angular/core';
import { GetService } from "./get.service";
import { RedirectService } from "./redirect.service";

@Component({
    selector: 'search',
    templateUrl: './app/search.component.html',
    providers: [GetService, RedirectService]
    //styleUrls: ['app.component.css']
})

@Injectable()
export class SearchComponent {

    private data: any;

    constructor(private getService: GetService, private redirectService: RedirectService){}

    submit(searchField: string) {
        if(searchField != '') {
            this.getService.getUrl(searchField).subscribe(
                data => {
                    this.data = data;
                    this.redirectService.redirect(this.data);
                }, error => { console.log("Error happened: " + error);}
            );
        }
    }

    onPressEnter(e, searchField){
        if(e.keyCode == 13 && searchField != ''){
            this.submit(searchField);
        }
    }
}
