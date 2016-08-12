/**
 * Created by aashil on 8/12/16.
 */

import { Component, OnInit } from "@angular/core";

@Component({
    selector: 'report',
    templateUrl: './app/report.component.html',
    styleUrls: ['https://maxcdn.bootstrapcdn.com/bootstrap/3.3.7/css/bootstrap.min.css" integrity="sha384-BVYiiSIFeK1dGmJRAkycuHAHRg32OmUcww7on3RYdg4Va+PmSTsz/K68vbdEjh4u']
})

export class ReportComponent implements OnInit{

    ngOnInit() {
        console.log('testing the on init');
    }

}