/**
 * Created by aashil on 8/12/16.
 */

import { Component } from '@angular/core';
import { QueryService } from './query.service';
// import { AuthHttp } from 'angular2-jwt';
import { AuthService } from './auth.service';

@Component({
    selector: 'report',
    templateUrl: './app/report.component.html',
    providers: [QueryService]
})

export class ReportComponent {

    private data: any;

    constructor(private queryService: QueryService, private auth: AuthService) {

        this.auth.authEvent().subscribe(
            token => {
                if (token) {
                    this.queryService.getQueries().subscribe(
                        data => {
                            this.data = data;
                        }, error => {
                            console.log('Error happened: ' + error);
                        }
                    );
                } else {
                    this.data = [];
                }
            },
            err => {
                console.log('authEvent', err);
            }
        );
    }
}
