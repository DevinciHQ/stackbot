declare var ga: Function;

export class GoogleAnalyticsService {

    public event(eventCategory: string, eventAction: string, eventLabel: string) {
        ga('send', 'event', eventCategory, eventAction, eventLabel);
    }
    public setUserId(userId: string) {
        ga('set', 'userId', userId);
    }
    public unsetUserId() {
        ga('unset', 'userId', null);
    }

}
