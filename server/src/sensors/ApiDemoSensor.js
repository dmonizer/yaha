import BaseSensor from "../server-components/BaseSensor.js";
import fetch from "node-fetch";

export default class ApiDemoSensor extends BaseSensor {
    constructor() {
        super("ApiDemoSensor", 5)
    }

    capabilities() {
        if (!this.api) {
            return {}
        }
        this.api.logger.debug(this.self.name + " capabilities()")
        
        return {
            capabilities: [
                this.api.capabilities.EXTERNAL_CONNECTION,
                this.api.capabilities.STATE_PRODUCER
            ]
        }
    }
    run() {
        this.api.config.set("url", "https://reqres.in/api/users/") // illustrating configuration saving.
        const url = this.api.config.get("url") + this._randomIntBetween(1, 6);

        this.api.logger.debug("Starting run() with url "+url)
        fetch(url, this.api.proxyAgent ? {
                agent: this.api.proxyAgent
            } : {})
            .then((result) => result.ok ? result.json() : new Error(result.error()))
            .then(json => { 
                //this.api.logger.info("User " + json.data.first_name + " " + json.data.last_name + " logged in."); 
                this.api.state.set("User " + json.data.first_name + " " + json.data.last_name + " logged in.") })
            .catch((err) => 
            this.api.logger.error(JSON.stringify(err)));
        this.api.logger.debug("Ending run()")
    }


    _randomIntBetween(min, max) {
        return Math.floor(Math.random() * (max - min + 1) + min);
    }
}