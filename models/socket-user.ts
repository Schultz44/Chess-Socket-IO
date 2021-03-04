export class SocketUser {
    user;
    id;
    room;
    constructor(data = {}){
        Object.assign(this, data);
    }
}