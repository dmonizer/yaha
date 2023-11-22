import BaseSensor from "../server-components/BaseSensor.js";
import fetch from "node-fetch";

/**
 * This is a demo sensor that calls external api and updates state based on that, simulating users logging in/out and coming home/leaving home
 */
export default class ApiDemoSensor extends BaseSensor {
    constructor() {
        super("ApiDemoSensor", {interval: 5})
    }

    sensorInit() {
        this.api.config.set("url", "https://reqres.in/api/users/") // illustrating configuration saving.
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
                this.api.state.set("User " + json.data.first_name + " " + json.data.last_name + [" logged in.", " logged out.", " is at home.", " left home."][this._randomIntBetween(0, 3)])
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
