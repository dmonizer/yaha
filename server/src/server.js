import ProxyAgent from "https-proxy-agent";
import StateMachine from "./server-components/StateMachine.js"
import MessageDistributor from "./server-components/MessageDistributor.js"
import Logger from "./server-components/Logger.js"
import ConfigurationMachine from './server-components/ConfigurationStore.js'
import SensorLoader from "./server-components/SensorLoader.js"
import YAHA_CONFIGURATION from "./server-components/model/configuration-constants.js";

const api = {}
const workingDirectory = process.cwd()

const logger = new Logger();
const log = logger.createLogger("server")
log.info("Starting YAHA")
api.createLogger = logger.createLogger;

if (process.env.PROXY) {
    log.info(`Configuring proxy from environment variable ${process.env.PROXY} `)
    api.proxyAgent = new ProxyAgent(process.env.PROXY);
}


const configurationMachine = new ConfigurationMachine(api.createLogger);

const yahaConfiguration = configurationMachine.getConfiguratorFor(0, "yaha-instance");
yahaConfiguration.set("config", YAHA_CONFIGURATION) // sensors should be somehow able to read and subscribe to this

const messageDistributor = new MessageDistributor(logger.createLogger)

api.state = new StateMachine(configurationMachine, messageDistributor);

const sensorLoader = new SensorLoader(YAHA_CONFIGURATION.SENSOR_PATHS.map(path=>workingDirectory+path), api, configurationMachine, yahaConfiguration)

api.state.subscribe(sensorLoader.getName(), (state) => {
    log.debug("sensor state changed: ", state)
})

const sensors = sensorLoader.loadAllSensors()

api.state.subscribe("WeatherSensor", (state) => {
    log.debug("WeatherSensor state change: ", state)
})
api.state.subscribe("ApiDemoSensor", (state) => {
    log.debug("ApiDemoSensor state change: ", state)
})
setInterval(() => true, 2000)
