import {Logger} from "./utilities/logger";

class MessageSubscribers {
    private _subscribers = new Array<Array<Function>>();
    private _messageTypes = new Array<string>()

    public isKnownType(messageType: string): boolean {
        return this._messageTypes.indexOf(messageType)!== -1;
    }

    public add(messageType: string, subscriber: Function) {
        let index = this._messageTypes.indexOf(messageType)
        if (index === -1) {
            index = this._messageTypes.push(messageType)-1
            this._subscribers[index] = new Array<Function>()
        }

        this._subscribers[index].push(subscriber)

    }

    public get(messageType: string) {
        return this._subscribers[this._messageTypes.indexOf(messageType)]
    }

    public hasSubscribers(messageType: string): boolean {
        if (!this._subscribers || !this._messageTypes) return false
        if (this._subscribers?.length == 0 || this._messageTypes?.length == 0) return false
        return this._subscribers[this._messageTypes.indexOf(messageType)].length > 0;
    }

}

export default class MessageDistributor {
    private messageTypes = new MessageSubscribers()
    private log

    constructor() {
        this.log = Logger("MessageDistributor")
    }

    addSubscriber = (messageType: any, subscriber: Function) => {
        this.messageTypes.add(messageType, subscriber)
    }

    distribute = (messageType: any, message: any) => {
        if (this.messageTypes.hasSubscribers(messageType)) {
            this.messageTypes.get(messageType).map(subscriber => subscriber(message))
        }
    }
}
