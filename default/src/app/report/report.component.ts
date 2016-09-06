/**
 * Created by aashil on 8/12/16.
 */

import { Component } from '@angular/core';
import { QueryService } from '../query/query.service';
import { AuthService } from '../auth/index';
// Note that this also imports moment itself.
import * as moment from 'moment-timezone';

@Component({
    selector: 'report',
    templateUrl: 'report.component.html',
    styleUrls: ['report.component.css'],
    providers: [QueryService]
})
export class ReportComponent {

    public data: any;

    public tz: string;

    public formatMonth(dateTime: moment.Moment): string {
        return  dateTime.format('MMM');
    }

    public formatDayOfMonth(dateTime: moment.Moment): string {
        return  dateTime.format('D');
    }

    formatTime(dateTime: moment.Moment) {
        return dateTime.format('LT');

    }

    public setTimezone(timezone: string = null) {
        if (timezone) {
           this.tz = timezone;
        } else {
            this.tz = moment.tz.guess();
        }
        moment.tz.setDefault(this.tz);
    }

    constructor(private queryService: QueryService, private auth: AuthService) {
        this.setTimezone();

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
            let date = moment.utc(item.timestamp);
            let localDate = moment.tz(date, this.tz);
            let endOfDay = moment.tz(date, this.tz).endOf('day');
            if (currDay === null || currDay > endOfDay ) {
                currDay = endOfDay;
                newData.push({
                    'type' : 'day',
                    'name': endOfDay.format('dddd'),
                    'timestamp': endOfDay
                });
            }
            newData.push({
                    'type' : 'query',
                    'query': item.query,
                    'timestamp': localDate
                    'tags' : item.tags,
            });
        }
        return newData;
    }
}
