const api = {}
const sensorsPath = process.cwd() + "/server/src/sensors/"

import ProxyAgent from "https-proxy-agent";
import StateMachine from "./state.js"
import Messages from "./Messages.js"
import createLogger from "./server-components/logging.js"
const logger = createLogger("server")
logger.info("Starting YAHA")
import ConfigurationMachine from './server-components/configurationMachine.js'
import SensorLoader from "./server-components/SensorLoader.js"

if (process.env.PROXY) {
  logger.info(`Configuring proxy from environment variable ${process.env.PROXY} `)
  api.proxyAgent = new ProxyAgent(process.env.PROXY);
}

api.createLogger = createLogger;
api.state = new StateMachine(new Messages());
const configurationMachine = new ConfigurationMachine(api.createLogger);
const sensorLoader = new SensorLoader(sensorsPath, api, configurationMachine)

api.state.subscribe(sensorLoader.getName(), (state) => {
  logger.debug("sensor state changed: ", state)
})

const sensors = sensorLoader.loadAllSensors()

api.state.subscribe("WeatherSensor", (state) => {
  logger.debug("WeatherSensor state change: ", state)
})

setInterval(() => true, 2000)