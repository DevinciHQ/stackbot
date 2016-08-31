export class Integration {
    public name: string;
    public active: boolean;
    public pending: boolean;

    constructor({name, active = false, pending = false}: {name?: string, active?: boolean, pending?: boolean} = { }) {
        this.name = name;
        this.active = active;
        this.pending = pending;
    }
}
