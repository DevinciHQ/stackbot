
import { Component } from '@angular/core';
import { Injectable } from '@angular/core';
import { GetService } from './get.service';
import { RedirectService } from './redirect.service';
import { AngularFire } from 'angularfire2';

@Component({
    selector: 'search',
    templateUrl: './app/search.component.html',
    providers: [GetService, RedirectService]
    // styleUrls: ['app.component.css']
})

@Injectable()
export class SearchComponent {

    private data: any;
    private uid: String;

    constructor(private getService: GetService, private redirectService: RedirectService, private af: AngularFire) {}

    submit(searchField: string) {
        if (searchField !== '') {

            this.af.auth.subscribe(
              auth => {
                  if (auth != null) {
                      this.uid = auth.uid;
                  }
                  this.getService.getUrl(searchField, this.uid).subscribe(
                        data => {
                            this.data = data;
                            this.redirectService.redirect(this.data);
                        }, error => { console.log('Error happened: ' + error); }
                  );
              }
            );
        }
    }

    onPressEnter(e, searchField) {
        if (e.keyCode === 13 && searchField !== '') {
            this.submit(searchField);
        }
    }
}
