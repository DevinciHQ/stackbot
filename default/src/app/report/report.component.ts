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

    public data: any = [];

    public tz: string;

    public cursor: any = null;

    public currDay: moment.Moment = null;

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
                    this.data = [];
                }
            },
            err => {
                console.log('authEvent', err);
            }
        );
    }

    processData(items: any[]) {
        let newData: any[] = [];
        for (let item of items) {
            // Set the global cursor if the cursor exist in the data.
            if (item.cursor) {
                this.cursor = item.cursor;
                continue;
            }
            if (item.cursor === 'None') {
                this.cursor = null;
            }
            let date = moment.utc(item.timestamp);
            let localDate = moment.tz(date, this.tz);
            let endOfDay = moment.tz(date, this.tz).endOf('day');
            if (this.currDay === null || this.currDay > endOfDay ) {
                this.currDay = endOfDay;
                newData.push({
                    'type' : 'day',
                    'name': endOfDay.format('dddd'),
                    'timestamp': endOfDay,
                });
            }
            newData.push({
                    'type' : 'query',
                    'query': item.query,
                    'timestamp': localDate,
                    'tags' : item.tags || <string[]>[],
            });
        }
        return newData;
    }

    getMoreData(cursor) {
        this.queryService.getQueries(cursor).subscribe(
            (data: any[]) => {
                // Check if the data returned isn't empty.
                if (data.length !== 0) {
                    this.data = this.data.concat(this.processData(data));
                } else {
                    // This sets the cursor to null when we get an empty response back.
                    // This signifies that we don't have any more data.
                    this.cursor = null;
                }
            }, error => {
                console.log('Error happened: ' + error);
            }
        );
    }
}
