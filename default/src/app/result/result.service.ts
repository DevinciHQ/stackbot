export class ResultService {

    data: any = [];

    processData(items: any[]) {
        let newData: any = [];
        for (let item of items) {
            if (item['googleRedirectLink']) {
                continue;
            }
            newData.push({
                'name' : item['name'],
                'url': item['url'],
                'displayUrl': item['displayUrl'],
                'snippet': item['snippet']
            });
        }
        this.data = newData;
    }

}
