
import { Component, Input} from '@angular/core';
import { AuthService } from './auth.service';
import { Integration } from '../shared/integration';

@Component({
    moduleId: module.id,
    selector: 'auth-integrations',
    template: `
         <div *ngIf="loggedIn && featureEnabled">
             <h2> Integrations</h2>
             <div *ngFor="let item of integrations | keys ">
                 {{item.value.name}}
                 <div class="status"[ngSwitch]="item.value.active" (click)="toggleAuth(item.value)" 
                 [ngClass]="{disabled: item.value.pending}">
                     <p *ngSwitchCase=false>DISABLED</p>
                     <p *ngSwitchCase=true>ENABLED</p>
                 </div>
             </div>
         </div>
         `,
    styles: [`
        .status.disabled,
        .status.disabled:hover {
          color: gray;
        }
        
        .status:hover {
           color: blue;
        }
    `]
})
export class AuthIntegrationsComponent {

    @Input() integrations: {[key: string]: Integration} = {};

    private loggedIn: boolean = false;

    private featureEnabled: boolean = false;

    constructor(public auth: AuthService) {
        // this.integrations.push(new Integration('linkedIn', true, false));

        // Only show this item if it's feature flag is enabled.
        let featureFlags = localStorage.getItem('featureFlags');
        if (featureFlags) {
            this.featureEnabled = true;
        }

        let _self = this;
        this.auth.getUser().subscribe(
            user => {
                if (user && user.loggedIn) {
                    // Setup the available integrations.
                    this.integrations['github'] = new Integration({name: 'github', pending: true});
                    this.loggedIn = true;
                    this.auth.getIntegrations(true).subscribe(
                        integrations => {
                            _self.integrations = integrations;
                        }
                    );
                } else {
                    this.loggedIn = false;
                }
            }
        );


    }

    toggleAuth(integration: Integration) {
        if (integration.pending) {
            // If we're pending, then ignore the click.
            return false;
        }
        // Set the pending state so that we can do our work uninterrupted.
        integration.pending = true;

        if (integration.active) {
            this.auth.disableIntegration(integration.name).subscribe({
                complete: () => {
                    integration.pending = false;
                }}
            );
            return;
        } else {
            this.auth.trigger_oauth('github').subscribe(
                result => {
                    // If it was successful, mark the integration as active.
                    if (result) {
                        integration.active = true;
                    }
                    integration.pending = false;
                }
            );
        }
    }

}
