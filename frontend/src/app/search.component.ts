
import { Component } from '@angular/core';
import { Injectable } from '@angular/core';
import { QueryService } from './query.service';
import { RedirectService } from './redirect.service';
import { AngularFire } from 'angularfire2';

@Component({
    selector: 'search',
    templateUrl: './app/search.component.html',
    providers: [QueryService, RedirectService]
    // styleUrls: ['app.component.css']
})

@Injectable()
export class SearchComponent {

    private uid: String;

    constructor(private getService: QueryService, private redirectService: RedirectService, private af: AngularFire) {}

    submit(searchField: string) {
        if (searchField !== '') {

            this.af.auth.subscribe(
              auth => {
                  if (auth != null) {
                      this.uid = auth.uid;
                  }
                  this.getService.getUrl(searchField, this.uid).subscribe(
                      data => {
                          if (data['success'] !== true) {
                              console.log('Backend returned false, don\'t redirect.');
                              return;
                          }
                          if (typeof(data['payload']['redirect']) !== 'string') {
                              console.log('Backend returned no redirect, don\'t redirect.');
                              return;
                          }
                          this.redirectService.redirect(data['payload']['redirect']);
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
