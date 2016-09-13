
import { Component } from '@angular/core';
import { QueryService } from '../query/index';
import {AuthService} from '../auth/auth.service';

@Component({
    selector: 'search',
    templateUrl: 'search.component.html',
    styleUrls: ['search.component.css'],
    providers: [QueryService],
})
export class SearchComponent {

    private preSearchText: any;
    private disabled = true;
    public redirect: string = null;
    constructor(private queryService: QueryService, private auth: AuthService) {
        this.preSearchText = this.populateSearch(window.location.href);
        this.recordOmniSearch(window.location.href);
        this.auth.getUser().subscribe(
            user => {
                if (user && user.loggedIn) {
                    this.disabled = false;
                } else {
                    this.disabled = true;
                }
            },
            err => {
                console.log('authEvent', err);
            }
        );
    }

    submit(searchField: string) {
        if (searchField !== '') {
          this.doSearch(searchField)  ;
        }
    }

    onPressEnter(e: any, searchField: any) {
        if (e.keyCode === 13 && searchField !== '') {
            this.doSearch(searchField);
        }
    }

    doSearch(searchField: any) {
        this.queryService.doQuery(searchField, 'site-search').subscribe(
            data => {
                this.redirect = data['payload']['redirect'];
                // If when data is returned from a query with a redirect set, do the redirect.
                if (this.redirect) {
                    this._redirect(this.redirect);
                }
            }
        );
    }

    populateSearch(href: any): string {
        let parameters = this.parseURLParams(href);
        return parameters['q'] || null;
    }

    recordOmniSearch(href: any) {
        let parameters = this.parseURLParams(href);
        if (parameters['q'] != null) {
            this.queryService.doQuery(parameters['q'], 'omnibox').subscribe(
              response => {
                  return;
              }, error => {
                  console.log('Error happened: ' + error);
              }
            );
        }
    }

    parseURLParams(url: any) {
        let getParams = {};
        // Split the url into two parts before and after the '?'
        let urlParts = url.split('?');
        if (urlParts.length === 2) {
            // Split the GET params into parts.
            let parameters = urlParts[1].split('&');
            // For each part, decode the key name and the value and add them to the output.
            for (let i = 0; i < parameters.length; i++) {
                let paramParts = parameters[i].split('=');
                // Replace '+' with spaces '%20' because the decodeURIComponent doesn't do it.
                getParams[decodeURIComponent(paramParts[0].replace(/\+/g, '%20'))] =
                    decodeURIComponent(paramParts[1].replace(/\+/g, '%20'));
            }
        }
        return getParams;
    }

    private _redirect(href: any) {
        window.location.href = href;
    }
}
