import {addProviders, inject, TestBed, async } from '@angular/core/testing';
import { ReportComponent } from './index';
import { QueryService } from '../query/index';
import { AuthService} from '../auth/auth.service';
import { Observable, BehaviorSubject, Observer }   from 'rxjs';
import { User } from '../shared/user';
import { HttpModule, XHRBackend, Response, ResponseOptions } from '@angular/http';
// Note that this also imports moment itself.
import * as moment from 'moment-timezone';
import { By } from '@angular/platform-browser';
import {BackendService} from '../shared/backend.service';

class MockQueryService {

    getQueries() {
        return Observable.create(
            (observer: Observer<any>) => {
                console.log("getQueries");
                observer.next({
                               'cursor': 'fake',
                               'payload': [
                                {
                                    'query': 'asdfasdf',
                                    'timestamp': '2016-09-01T22:04:38.787362'
                                },
                                {
                                    'query': 'asdf',
                                    'timestamp': '2016-09-01T20:52:51.506263'
                                },
                                {
                                    'query': 'asdfasdf',
                                    'timestamp': '2016-08-26T21:08:36.131316'
                                },
                                {
                                    'query': 'asdfasdf',
                                    'timestamp': '2016-08-25T21:43:19.979162'
                                }
                            ],
                            'success': true
                        });
                observer.complete();
            }
        );
    }
}


class MockAuthService {

    private user = new BehaviorSubject<User>(null);

    login() {
        console.log("auth:login()");
       this.user.next(new User({uid: '123abc', email: 'fake.test@example.com'}));
    }

    logout() {
        this.user.next(null);
    }

    getUser() {
        return this.user;
    }

}

class MockBackendService {

    request(endpoint: string, data: { [ key: string ]: string; }) {
        console.log("MockBackend:request()");
        return Observable.create(
            (observer: Observer<any>) => {
                observer.next({
                               'cursor': 'fake',
                               'payload': [
                                {
                                    'query': 'asdfasdf',
                                    'timestamp': '2016-09-01T22:04:38.787362'
                                },
                                {
                                    'query': 'asdf',
                                    'timestamp': '2016-09-01T20:52:51.506263'
                                },
                                {
                                    'query': 'asdfasdf',
                                    'timestamp': '2016-08-26T21:08:36.131316'
                                },
                                {
                                    'query': 'asdfasdf',
                                    'timestamp': '2016-08-25T21:43:19.979162'
                                }
                            ],
                            'success': true
                        });
                observer.complete();
            }
        );
    }

}

describe('More Button', () => {

    beforeEach(() => {
         TestBed.configureTestingModule({
             providers: [
                 ReportComponent,
                {provide: QueryService, useClass: MockQueryService},
                {provide: AuthService, useClass: MockAuthService},
                 {provide: BackendService, useClass: MockBackendService}
             ],
             declarations: [
                 ReportComponent,
             ]
        });
        TestBed.compileComponents();
    });

    // General button tests
    it('should display the button when there are more items. +++++++ ', async(
        inject([AuthService], ( auth: MockAuthService) => {

        let fixture = TestBed.createComponent(ReportComponent);
        let testComponent = fixture.debugElement.componentInstance;
        console.log(testComponent);
        // let html =  fixture.debugElement.source;
        // let html = fixture.debugElement.nativeElement.source;
        auth.login();
        // console.log(component.data);
        fixture.whenStable().then(() => {
            // let inputBox = <HTMLInputElement> fixture.debugElement.query(By.css('input')).nativeElement;
            // expect(inputBox.value).toEqual('Original Name');
             console.log("h1", fixture.debugElement.queryAll(By.css('h1')));
        });
    })));
    // let fixture = TestBed.createComponent(ReportComponent);
    // auth.login();
    // let testComponent = fixture.debugElement.componentInstance;
    // console.log(fixture);
    // let buttonDebugElement = fixture.debugElement.query(By.css('btn-secondary'));
    // console.log(buttonDebugElement);
    // testComponent.buttonColor = 'primary';
    // fixture.detectChanges();
    // expect(buttonDebugElement.nativeElement.classList.contains('upper-right')).toBe(true);

});
