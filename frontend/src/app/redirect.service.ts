/**
 * Created by aashil on 8/11/16.
 */

import { Injectable } from '@angular/core';

@Injectable()
export class RedirectService {

    public redirect(href) {
        window.location.href = href;
    }
}
