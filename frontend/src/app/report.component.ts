/**
 * Created by aashil on 8/12/16.
 */

import { Component, OnInit } from '@angular/core';
import { QueryService } from './query.service';
import { AngularFireAuth } from 'angularfire2';

@Component({
    selector: 'report',
    templateUrl: './app/report.component.html',
    providers: [QueryService]
})

export class ReportComponent implements OnInit {

    private data: any;

    constructor(private queryService: QueryService, private auth: AngularFireAuth) {}

    ngOnInit() {

        this.auth.subscribe(
            auth => {
                if (auth != null) {
                    this.queryService.getQueries().subscribe(
                        data => {
                            this.data = data;
                        }, error => { console.log('Error happened: ' + error);
                        }
                    );
                } else {
                    this.data = null;
                }
            }
        );
    }
}
