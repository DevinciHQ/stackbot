import { Component, Input } from '@angular/core';
import {ResultService} from './result.service';

@Component({
    selector: 'result',
    templateUrl: 'result.component.html',
})

export class ResultComponent {

    constructor(private resultService: ResultService) {}

}
