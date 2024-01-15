import {config} from "dotenv";
config()

import StateMachine from "./server-components/StateMachine"
import MessageDistributor from "./server-components/MessageDistributor"
import {Logger} from "./server-components/utilities/logger"
import ConfigurationMachine from './server-components/ConfigurationStore'
//import SensorLoader from "./server-components/SensorLoader"
import FrontendWebsocket from "./server-components/frontend/FrontendWebsocket"


import {YAHA_CONFIGURATION} from "./configuration-constants.js";
import {APIConfig} from "./server-components/model/APIConfig";
import {PluginManager} from "./server-components/utilities/PluginManager";
import {isRunnable, isSensor, Sensor} from "./server-components/model/PluginInterfaces";
import {SensorAPI} from "./server-components/model/SensorInterfaces";
import StateMachineSingleton from "./server-components/StateMachine";


const workingDirectory = process.cwd()


const log = Logger("server")
log.info("Starting YAHA")
log.info(process.env)

if (process.env.HTTPS_PROXY) {
    log.info(`Configuring proxy from environment variable ${process.env.HTTPS_PROXY} - DISABLED `)
    /*api.proxyAgent = new HttpsProxyAgent(process.env.HTTPS_PROXY);*/
}



const configurationMachine = new ConfigurationMachine();

const yahaConfiguration = configurationMachine.getConfiguratorFor("yaha-instance");
yahaConfiguration.set("config", YAHA_CONFIGURATION) // sensors should be somehow able to read and subscribe to this

const messageDistributor = new MessageDistributor()

const api: APIConfig = {
    state: StateMachineSingleton.get(messageDistributor)
}
//const {SENSOR_PATHS, PLUGIN_PATHS} = process.env || {SENSOR_PATHS:"", PLUGIN_PATHS:""}
const SENSOR_PATHS = '/sensors'

const createSensorApiForSensor=(sensorName:string) => {
    return new SensorAPI(
            yahaConfiguration,
            StateMachineSingleton.getIsolatedFor(sensorName),
            configurationMachine.getConfiguratorFor(sensorName))
}

StateMachineSingleton.getFull().subscribe("WeatherSensor", (state: any) => {
    log.debug("WeatherSensor state change: ", state)
})

const pluginManager = new PluginManager({pluginLocations : [SENSOR_PATHS], pluginNames : []})
pluginManager.loadedPlugins().then(plugins=> plugins.map((plugin)=> {
    if (isSensor(plugin)) {
        log.debug(`plugin ${plugin.name} is a Sensor, initializing...`);
        const sensor : Sensor = (plugin as Sensor)
        const initResult = sensor.initialize(createSensorApiForSensor(plugin.name))
        if (initResult.result) {
            log.info(`Setting sensor ${plugin.name} run interval to ${initResult.activation.interval} seconds`);
            setInterval(sensor.run.bind(sensor), initResult.activation.interval * 1000)
        }
    } else if (isRunnable(plugin)) {
        plugin.run().then((res=>log.debug("Plugin.run() finished with result: ",res)))
    }
}))
// if (SENSOR_PATHS) {
//     log.info("Loading sensors from ", SENSOR_PATHS)
//     const sensorLoader = new SensorLoader(SENSOR_PATHS.split(";")?.map(path => ensureTrailingSlash(workingDirectory) + path), api, configurationMachine, yahaConfiguration)
//     api.state.subscribe(sensorLoader.getName(), (state: any) => {
//         log.debug("sensor state changed: ", state)
//     })
//
//     const sensors = sensorLoader.loadAllSensors()
//

//     api.state.subscribe("ApiDemoSensor", (state : any) => {
//         log.debug("ApiDemoSensor state change: ", state)
//     })
// } else {
//     log.warn("Environment variable SENSOR_PATHS not found, skipping sensors loading.")
// }
//
// if (PLUGIN_PATHS) {
//     // const pluginLoader = new PluginLoader(PLUGIN_PATHS.split(';')?.map(path => ensureTrailingSlash(workingDirectory) + path))
// } else {
//     log.warn("Environment variable PLUGIN_PATHS not found, skipping plugins loading.")
// }
const frontendSockets = new FrontendWebsocket(9991, StateMachineSingleton.getFull())

setInterval(() => true, 2000)
