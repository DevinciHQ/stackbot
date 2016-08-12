/**
 * Created by aashil on 8/11/16.
 */

import { Injectable } from '@angular/core';

@Injectable()
export class RedirectService{

    redirect(redirectData){
        if (redirectData.success) {
            window.location.href = redirectData.payload.redirect;
        }
    }

}
