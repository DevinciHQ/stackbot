import { Routes, RouterModule } from '@angular/router';
import {IntegrationsComponent} from './integrations.component';
import { ReportComponent} from './report/index';

const appRoutes: Routes = [
    { path: 'report', component: ReportComponent },
    { path: 'integrations', component: IntegrationsComponent },
    { path: '', component: IntegrationsComponent },
];

export const appRoutingProviders: any[] = [

];

export const routing = RouterModule.forRoot(appRoutes);
