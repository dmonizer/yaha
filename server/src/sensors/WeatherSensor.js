import BaseSensor from "../server-components/BaseSensor.js"
import fetch from 'node-fetch'

const weatherUrl = "https://www.ilmateenistus.ee/wp-content/themes/ilm2020/meteogram.php/?locationId=784&coordinates=";
const COORDINATES_CONFIG_KEY = "coordinates-array"
/**
 * this is functional demo sensor loading outside temperatures for Tallinn, Tartu and Pärnu in Estonia from
 * http://www.ilmateenistus.ee/ webpage and updating the state with them
 */
export default class WeatherSensor extends BaseSensor {
    constructor() {
        super("WeatherSensor", {interval: 120});
    }

    sensorInit() {
        const coordinates = this.api.config.get(COORDINATES_CONFIG_KEY); // check configuration
        if (!coordinates || coordinates.length === 0) { // if required configuration is missing, provide defaults
            this.api.config.set(COORDINATES_CONFIG_KEY, ["59.4324376712365;24.7440656779973", "58.380052074416;26.722115910038", "58.382360108811;24.510843113106"]);
        }
    }

    capabilities() {
        if (!this.api) {
            return {}
        }
        this.api.logger.debug("capabilities()")

        return {
            capabilities: [this.api.capabilities.DISCOVERY,
                this.api.capabilities.EXTERNAL_CONNECTION,
                this.api.capabilities.STATE_PRODUCER]
        }
    }

    run() {
        this.api.logger.debug("Starting run()")

        const coordinates = this.api.config.get(COORDINATES_CONFIG_KEY);

        if (!coordinates || !coordinates.length > 0) {
            this.api.logger.warn(`Sensor ${this.getName()} is not configured properly, aborting sensor run`)
            return
        }

        coordinates.map(coords => {
            this._getWeatherForCoordinates(coords)
                .then((result) => {
                    this.api.state.set({
                        coords,
                        locationName: result.location,
                        temperatures: this._extractTemperatures(result)
                    })
                })

        })
        this.api.logger.debug("Ending run()")
    }

    end() {
    }

    _extractTemperatures(weather) {
        const timeSeries = weather.forecast.tabular.time
        return timeSeries.map(hourly => hourly.temperature["@attributes"].value)
    }

    _getWeatherForCoordinates(coordinates) {
        return fetch(weatherUrl + coordinates, {headers: {'accept': 'application/json'}})
            .then(result => result.json())
            .catch(err => {
                if (!err) {
                    return
                }
                this.api.logger.error("Error loading weather for coordinates " + JSON.stringify(coordinates) + " (" + JSON.stringify(err) + ")")
            })
    }
}
