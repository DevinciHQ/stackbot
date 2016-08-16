/**
 * Created by aashil on 8/12/16.
 */

import { Component, OnInit } from "@angular/core";
import { ReportService } from "./report.service";
import { AngularFire } from "angularfire2";

@Component({
    selector: 'report',
    templateUrl: './app/report.component.html',
    styleUrls: ['https://maxcdn.bootstrapcdn.com/bootstrap/3.3.7/css/bootstrap.min.css" integrity="sha384-BVYiiSIFeK1dGmJRAkycuHAHRg32OmUcww7on3RYdg4Va+PmSTsz/K68vbdEjh4u'],
    providers: [ReportService]
})

export class ReportComponent implements OnInit {

    private data: any;
    private uid: any;

    constructor(private reportService: ReportService, private af: AngularFire){}

    ngOnInit() {
        this.af.auth.subscribe(
            auth => {
                if(auth != null){
                    this.uid = auth.uid;
                    this.reportService.getReport(this.uid).subscribe(
                        data => {
                            this.data = data;
                        }, error => { console.log("Error happened: " + error);
                        }
                    );
                }
            }
        );
    }

}