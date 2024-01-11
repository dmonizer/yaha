import {Logger} from "../logger";

export type SubscriberFunction = (key: string, value: any, caller: string) => void
export interface SingleConfigurationStore {
    get: (key: string) => any
    set: (key: string, value: any) => void,
    delete: (key: string) => void,
    subscribe: (subscriber: SubscriberFunction) => void
}
export default class ConfigurationStore {
    private log
    private store: Map<number, Map<string, any>> = new Map()

    constructor() {
        this.log = Logger("ConfigurationStore");
        // This is a "in-memory" configuration store - meant as an initial development tool.
        // in real life, this should be held in an actual database
        // TODO:
        //  * should take as an input also name/filename+path of the sensor and check if configuration already exists
        //  * implement DB backend

        this.store = this.loadStore();
    }

    getConfiguratorFor = (id: number, name: string) : SingleConfigurationStore => { // returns configurator, which is limited to seeing only items in its "own" store, identified by ID. Meant for sensors
        if (!this.store.get(id)) {
            this.store.set(id, new Map<string, string>());
        }
        return {
            get: (key: string) => this.get(id, key),
            set: (key: string, value: any) => this.set(id, key, value),
            delete: (key: string) => this.delete(id, key),
            subscribe: (subscriber: SubscriberFunction) => this.subscribe(id, subscriber)
        }
    }

    /**
     * Get access to whole state database
     * @param callerName
     * @returns {function(*): {set: *, get: *, delete: *}}
     */
    getFullConfigurator = (callerName: string) => {
        if (!callerName) {
            this.log.error("Please specify callerName for getFullConfigurator")
        }
        return (configId: number) => {
            return {
                get: (key:string) => this.get(configId, key),
                set: (key:string, value:any) => this.set(configId, key, value),
                delete: (key:string) => this.delete(configId, key),
            }
        }
    }

    // TODO: subscribing should be moved to messaging
    subscribe = (id: number, subscriber: SubscriberFunction) => {
        const subscribers = this.get(id, "_subscribers") || new Map<string, Function[]>();
        subscribers.push(subscriber)
        this.set(id, "_subscribers", subscribers)
    }

    get = (id: number, key: string) => {
        let value = this.store.get(id)?.get(key);
        this.log.debug(`Returning '${key}' = '${value}' for ${id}`);
        return value;
    }

    set = (id: number, key: string, value: any) => {
        this.log.debug(`Setting '${key}' = '${value}' for ${id}`);
        if (!key) {
            throw new Error(`Invalid (empty) key for ${id}`);
        }
        if (key[0]==="_") {
            throw new Error(`Property names beginning with underscore are for internal use, change is not allowed.`)
        }
        this.store.get(id)?.set(key, value);

        // notify subscribers of configuration change
        // caller is empty if config change is initated by "owner" of the particular "store"
        // hence subscribers are NOT notified (NOT 100% sure if this is a good idea :) )

        const subscribers: Function[] = this.store.get(id)?.get("_subscribers") as Function[]
        subscribers?.forEach(subscriber => subscriber(key, value))

        this.saveStore();
    }

    delete = (id: number, key: string) => {
        this.log.debug(`Deleting '${key}' for ${id}`);
        this.store.get(id)?.delete(key);
    }

    saveStore = () => {

    }

    loadStore = () => {
        return new Map();
    }
}
