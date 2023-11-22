export default class ConfigurationStore {
    constructor(createLogger) {
        this.logger = createLogger("ConfigurationStore");
        // This is a "in-memory" configuration store - meant as an initial development tool.
        // in real life, this should be held in an actual database
        // TODO:
        //  * should take as an input also name/filename+path of the sensor and check if configuration already exists
        //  * implement DB backend

        this.store = this.loadStore();
    }

    getConfiguratorFor = (id, name) => { // returns configurator, which is limited to seeing only items in its "own" store, identified by ID. Meant for sensors
        this.store[id] = {
            _name: name,
            _subscribers: []
        }
        return {
            get: this.get.bind(this, "", id),
            set: this.set.bind(this, "", id),
            delete: this.delete.bind(this, "", id),
            subscribe: this.subcribe.bind(this, id)
        }
    }

    getFullConfigurator = (callerName) => {
        if (!callerName) {
            this.logger.error("Please specify callerName for getFullConfigurator")
        }
        return (configId) => {
            return {
                get: this.get.bind(this, callerName, configId),
                set: this.set.bind(this, callerName, configId),
                delete: this.delete.bind(this, callerName, configId),
            }
        }
    }

    subcribe = (id, subscriber = (key, value, caller) => {
    }) => {
        this.store[id]["_subscribers"].push(subscriber);
    }

    get = (caller, id, key) => {
        this.logger.debug(`Returning '${key}' = '${this.store[id][key]}' for ${id}`);
        return this.store[id][key];
    }

    set = (caller, id, key, value) => {
        this.logger.debug(`Setting '${key}' = '${value}' for ${id}`);
        if (key[0] === "_") {
            this.logger.warn(`Property names beginning with underscore are for internal use, change is not allowed.`)
            return
        }
        this.store[id][key] = value;

        // notify subscribers of configuration change
        // caller is empty if config change is initated by "owner" of the particular "store"
        // hence subscribers are NOT notified (NOT 100% sure if this is a good idea :) )
        if (caller !== "") {
            this.store[id]["_subscribers"].forEach(subscriber => subscriber(key, value, caller))
        }

        this.saveStore();
    }

    delete = (id, key) => {
        this.logger.debug(`Deleting '${key}' for ${id}`);
        this.store[id][key] = undefined;
    }

    saveStore = () => {

    }

    loadStore = () => {
        return [];
    }
}
