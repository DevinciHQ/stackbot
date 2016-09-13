export class User {
    public uid: string;
    public email: string;
    public loggedIn: boolean;

    // This format of parameters makes it easy to construct
    // See https://github.com/Microsoft/TypeScript/issues/467#issuecomment-189306531
    constructor({uid = null, email = null, loggedIn = false}: {uid?: string, email?: string, loggedIn?: boolean } = { }) {
        this.uid = uid;
        this.email = email;
        this.loggedIn = loggedIn;
    }
}
