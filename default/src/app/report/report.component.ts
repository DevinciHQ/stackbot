/**
 * Created by aashil on 8/12/16.
 */

import { Component } from '@angular/core';
import { QueryService } from '../query/query.service';
import { AuthService } from '../auth/index';
import * as moment from 'moment';

@Component({
    selector: 'report',
    templateUrl: 'report.component.html',
    styleUrls: ['report.component.css'],
    providers: [QueryService]
})

export class ReportComponent {

    public data: any;

    public formatMonth(dateTime: string): string {
        return  moment(dateTime).format('MMM');
    }

    public formatDayOfMonth(dateTime: string): string {
        return  moment(dateTime).format('D');
    }

    constructor(private queryService: QueryService, private auth: AuthService) {
        this.auth.getUser().subscribe(
            user => {
                if (user) {
                    this.queryService.getQueries().subscribe(
                        (data: any[]) => {
                            this.data = this.processData(data);
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

    processData(items: any[]) {
        let currDay: any = null;
        let newData: any[] = [];
        for (let item of items) {
            let date = moment(item.timestamp, moment.ISO_8601);
            let endOfDay = moment(date).endOf('day');
            if (currDay === null || currDay > endOfDay ) {
                currDay = endOfDay;
                newData.push({
                    'type' : 'day',
                    'name': endOfDay.format('dddd'),
                    'timestamp': endOfDay.format()
                });
            }
            newData.push({
                    'type' : 'query',
                    'query': item.query,
                    'timestamp': date.format()
            });
        }
        return newData;
    }
    formatTime(dateTime: string) {
        return moment(dateTime).format('LT');

    }
}
