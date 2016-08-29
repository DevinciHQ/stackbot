export class User {
    public uid: string;
    public email: string;

    // This format of parameters makes it easy to construct
    // See https://github.com/Microsoft/TypeScript/issues/467#issuecomment-189306531
    constructor({uid = null, email = null}: {uid?: string, email?: string} = { }) {
        this.uid = uid;
        this.email = email;
    }
}
