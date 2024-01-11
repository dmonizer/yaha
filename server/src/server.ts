import {config} from "dotenv";

import StateMachine from "./server-components/StateMachine"
import MessageDistributor from "./server-components/MessageDistributor"
import {Logger} from "./logger"
import ConfigurationMachine from './server-components/ConfigurationStore'
import SensorLoader from "./server-components/SensorLoader"
import FrontendWebsocket from "./server-components/frontend/FrontendWebsocket"
import PluginLoader from "./server-components/PluginLoader"

import {YAHA_CONFIGURATION} from "./server-components/model/configuration-constants.js";
import {APIConfig} from "./server-components/model/APIConfig";

config()

const workingDirectory = process.cwd()


const log = Logger("server")
log.info("Starting YAHA")
log.info(process.env)

if (process.env.HTTPS_PROXY) {
    log.info(`Configuring proxy from environment variable ${process.env.HTTPS_PROXY} - DISABLED `)
    /*api.proxyAgent = new HttpsProxyAgent(process.env.HTTPS_PROXY);*/
}


const configurationMachine = new ConfigurationMachine();

const yahaConfiguration = configurationMachine.getConfiguratorFor(0, "yaha-instance");
log.debug("Configuration: ",YAHA_CONFIGURATION)
yahaConfiguration.set("config", YAHA_CONFIGURATION) // sensors should be somehow able to read and subscribe to this

const messageDistributor = new MessageDistributor()

const api: APIConfig = {
    createLogger: Logger,
    state: new StateMachine(configurationMachine, messageDistributor)
}
const {SENSOR_PATHS, PLUGIN_PATHS} = process.env
if (SENSOR_PATHS) {
    log.info("Loading sensors from ", SENSOR_PATHS)
    const sensorLoader = new SensorLoader(SENSOR_PATHS.split(";")?.map(path => workingDirectory + path), api, configurationMachine, yahaConfiguration)
    api.state.subscribe(sensorLoader.getName(), (state: any) => {
        log.debug("sensor state changed: ", state)
    })

    const sensors = sensorLoader.loadAllSensors()

    api.state.subscribe("WeatherSensor", (state: any) => {
        log.debug("WeatherSensor state change: ", state)
    })
    api.state.subscribe("ApiDemoSensor", (state : any) => {
        log.debug("ApiDemoSensor state change: ", state)
    })
} else {
    log.warn("Environment variable SENSOR_PATHS not found, skipping sensors loading.")
}

const frontendSockets = new FrontendWebsocket(9991, api.state)

if (PLUGIN_PATHS) {
    const pluginLoader = new PluginLoader(PLUGIN_PATHS.split(';')?.map(path => workingDirectory + path))
} else {
    log.warn("Environment variable PLUGIN_PATHS not found, skipping plugins loading.")
}

setInterval(() => true, 2000)
