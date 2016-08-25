export class User {
    public uid: string;
    public email: string;

    constructor(user: any) {
        this.uid = user.uid;
    }
}
