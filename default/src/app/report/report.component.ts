/**
 * Created by aashil on 8/12/16.
 */

import { Component } from '@angular/core';
import { QueryService } from '../query/query.service';
import { AuthService } from '../auth/index';

@Component({
    selector: 'report',
    templateUrl: 'report.component.html',
    providers: [QueryService]
})

export class ReportComponent {

    private data: any;

    public formatDate(date: string): string {
        let date_object: any;
        date_object = new Date(date);
        // Adding 11 to the actual hour to address the 00 (midnight 12 am) case.
        let hours = (date_object.getHours() + 11) % 12 + 1;
        let minutes = date_object.getMinutes();
        let month = date_object.getMonth() + 1;
        let day = date_object.getDate();
        let am_pm = date_object.getHours() >= 12 ? 'PM' : 'AM';
        let hours_fixed = hours <= 9 ? '0' + hours : hours;
        let minutes_fixed = minutes <= 9 ? '0' + minutes : minutes;
        return hours_fixed + ':' + minutes_fixed + ' ' + am_pm + ' ' + month + '/' + day;
    }

    constructor(private queryService: QueryService, private auth: AuthService) {
        this.auth.getUser().subscribe(
            user => {
                if (user) {
                    this.queryService.getQueries().subscribe(
                        data => {
                            this.data = data;
                        }, error => {
                            console.log('Error happened: ' + error);
                        }
                    );
                } else {
                    this.data = null;
                }
            },
            err => {
                console.log('authEvent', err);
            }
        );
    }
}
