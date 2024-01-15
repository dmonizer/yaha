import BaseSensor from "../server-components/model/BaseSensor"
import { RequestInfo, RequestInit } from "node-fetch";
import {Logger} from "../server-components/utilities/logger";

//const fetch = (url: RequestInfo, init?: RequestInit) =>  import("node-fetch").then(({ default: fetch }) => fetch(url, init));


const weatherUrl = "https://www.ilmateenistus.ee/wp-content/themes/ilm2020/meteogram.php/?locationId=784&coordinates=";
const COORDINATES_CONFIG_KEY = "coordinates-array"
/**
 * this is functional demo sensor loading outside temperatures for Tallinn, Tartu and Pärnu in Estonia from
 * http://www.ilmateenistus.ee/ webpage and updating the state with them
 */
const log = Logger("WeatherSensor")
export default class WeatherSensor extends BaseSensor {
    constructor() {
        super("WeatherSensor", {interval: 10});
    }

    sensorInit() {
        const coordinates = this.api.config.get(COORDINATES_CONFIG_KEY); // check configuration
        if (!coordinates || coordinates.length === 0) { // if required configuration is missing, provide defaults
            this.api.config.set(COORDINATES_CONFIG_KEY, ["59.4324376712365;24.7440656779973", "58.380052074416;26.722115910038", "58.382360108811;24.510843113106"]);
        }
    }

    capabilities() {
        log.debug("capabilities()")
    }

    run() {
        log.debug("Starting run()")

        const coordinates = this.api.config.get(COORDINATES_CONFIG_KEY) as Array<string>;

        if (!coordinates || (coordinates.length === 0)) {
            log.warn(`Sensor ${this.getName()} is not configured properly, aborting sensor run: ${JSON.stringify(coordinates)}`)
            return
        }

        coordinates.forEach(coords => {
            this._getWeatherForCoordinates(coords)
                .then((result:any) => {
                    //log.debug(`Weather for coordinates (${JSON.stringify(coords)}): ${JSON.stringify(result)}`)
                        this.api.state.set( {
                        coords,
                        locationName: result.location,
                        temperatures: this._extractTemperatures(result)
                    })
                })

        })
        log.debug("Ending run()")
    }

    end() {
    }

    _extractTemperatures(weather : any) {
        const timeSeries = weather.forecast.tabular.time
        return timeSeries.map((hourly:any) => hourly.temperature["@attributes"].value)
    }

    async _getWeatherForCoordinates(coordinates: string) {
        return  fetch(weatherUrl + coordinates, {headers: {'accept': 'application/json'}})
            .then((result:any) => result.json())
            .catch((err:any) => {
                if (!err) {
                    return
                }
                log.error("Error loading weather for coordinates " + JSON.stringify(coordinates) + " (" + JSON.stringify(err) + ")")
            })
    }
}
