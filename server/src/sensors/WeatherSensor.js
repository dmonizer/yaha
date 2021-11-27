import BaseSensor from "../server-components/BaseSensor.js"
import fetch from 'node-fetch'
const weatherUrl = "http://www.ilmateenistus.ee/wp-content/themes/emhi2013/meteogram.php/?coordinates="
const COORDINATES_CONFIG_KEY = "coordinates-array"

export default class WeatherSensor extends BaseSensor {
  constructor() {
    super("WeatherSensor", 10);
  }

  capabilities() {
    if (!this.api) {
      return {}
    }

    return {
      capabilities: [this.api.capabilities.DISCOVERY,
      this.api.capabilities.EXTERNAL_CONNECTION,
      this.api.capabilities.STATE_PRODUCER]
    }
  }

  run() {
    this.api.config.set(COORDINATES_CONFIG_KEY, ["59.4324376712365;24.7440656779973"])
    const coordinates = this.api.config.get(COORDINATES_CONFIG_KEY);
    if (!coordinates || !coordinates.length > 0) {
      return
    }
    coordinates.map(coords => {
      this._getWeatherForCoordinates(coords)
        .then((result) => {
          this.api.setState({ 
            coords, 
            locationName : result.location,
            temperatures:this._extractTemperatures(result) })
        })
        
    })
  }

  end() {
  }

  _extractTemperatures(weather) {
    const timeSeries = weather.forecast.tabular.time
    return timeSeries.map(hourly => hourly.temperature["@attributes"].value)
  }

  _getWeatherForCoordinates(coordinates) {
    return fetch(weatherUrl + coordinates, { headers: { 'accept': 'application/json' } })
    .then(result => result.json())
    .catch(err => {
          if (!err) { return } 
          this.api.logger.error("Error loading weather for coordinates " + JSON.stringify(coords) + " (" + JSON.stringify(err) + ")")
        })
  }
}