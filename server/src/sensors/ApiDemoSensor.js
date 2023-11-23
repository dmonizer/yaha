import BaseSensor from "../server-components/BaseSensor.js";
import fetch from "node-fetch";

const ACTIONS = {
    LOGGED: {stateName: 'logged'},
    HOME: {stateName: 'home'}
}
/**
 * This is a demo sensor that calls external api and updates state based on that, simulating users logging in/out and coming home/leaving home
 */
export default class ApiDemoSensor extends BaseSensor {
    constructor() {
        super("ApiDemoSensor", {interval: 5})
    }

    sensorInit() {
        this.api.config.set("url", "https://reqres.in/api/users/") // illustrating configuration saving.
        const initialState = {};
        Object.getOwnPropertyNames(ACTIONS).forEach(actionName => {
            const name = ACTIONS[actionName].stateName;
            initialState[name] = []
        })
        this.api.state.set(initialState);
    }

    capabilities() {
        if (!this.api) {
            return {}
        }
        this.api.logger.debug(this.self.name + " capabilities()")

        return {
            capabilities: [this.api.capabilities.EXTERNAL_CONNECTION, this.api.capabilities.STATE_PRODUCER]
        }
    }

    run() {
        const url = this.api.config.get("url") + this._randomIntBetween(1, 6);

        this.api.logger.debug("Starting run() with url " + url)
        fetch(url, this.api.proxyAgent ? {
            agent: this.api.proxyAgent
        } : {})
            .then((result) => result.ok ? result.json() : new Error(result.error()))
            .then(json => {
                const action = ACTIONS[Object.getOwnPropertyNames(ACTIONS)[this._randomIntBetween(0, 1)]];
                const currentState = this.api.state.get();

                const persons = currentState.state[action.stateName]
                const person = json.data.first_name + " " + json.data.last_name;
                if (persons.indexOf(person) === -1) {
                    persons.push(person)
                    this.api.logger.info(`${person} added to ${action.stateName}`)
                } else {
                    persons.splice(persons.indexOf(person), 1)
                    this.api.logger.info(`${person} removed from ${action.stateName}`)
                }
                currentState.state[action.stateName] = persons;
                this.api.state.set(currentState.state);
            })
            .catch((err) => this.api.logger.error(JSON.stringify(err)));
        this.api.logger.debug("Ending run()")
    }

    end() {

    }

    _randomIntBetween(min, max) {
        return Math.floor(Math.random() * (max - min + 1) + min);
    }
}
