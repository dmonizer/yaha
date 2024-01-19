import {config} from "dotenv";
import StateMachineSingleton from "./server-components/StateMachine"
import {Logger} from "./server-components/utilities/logger"
import ConfigurationMachine from './server-components/ConfigurationStore'
import FrontendWebsocket from "./server-components/frontend/FrontendWebsocket"


import {YAHA_CONFIGURATION} from "./configuration-constants.js";
import {PluginManager} from "./server-components/utilities/PluginManager";
import {isRunnable, isSensor, Sensor} from "./server-components/model/PluginInterfaces";
import {SensorAPI} from "./server-components/model/SensorInterfaces";
import {EntityManager} from "./server-components/EntityManager";

config()

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

const entityManager = new EntityManager();

//const {SENSOR_PATHS, PLUGIN_PATHS} = process.env || {SENSOR_PATHS:"", PLUGIN_PATHS:""}
const SENSOR_PATHS = '/sensors'
const PLUGIN_PATHS = '/plugins'

const createSensorApiForSensor = (sensorName: string) => {
    return new SensorAPI(
            yahaConfiguration,
            StateMachineSingleton.getIsolatedFor(sensorName),
            configurationMachine.getConfiguratorFor(sensorName),
            entityManager)
}

StateMachineSingleton.getFull()
        .subscribe("WeatherSensor", (state: any) => {
            log.debug("WeatherSensor state change: ", state)
        })

const pluginManager = new PluginManager({pluginLocations: [SENSOR_PATHS, PLUGIN_PATHS], pluginNames: []})
pluginManager.loadedPlugins()
        .then(plugins => plugins.map((plugin) => {
            if (isSensor(plugin)) {
                log.debug(`plugin ${plugin.name} is a Sensor, initializing...`);
                const sensor: Sensor = (plugin as Sensor)
                const initResult = sensor.initialize(createSensorApiForSensor(plugin.name))
                if (initResult.result) {
                    log.info(`Setting sensor ${plugin.name} run interval to ${initResult.activation.interval} seconds`);
                    setInterval(sensor.run.bind(sensor), initResult.activation.interval * 1000)
                }
            } else if (isRunnable(plugin)) {
                plugin.api = createSensorApiForSensor(plugin.name);
                plugin
                        .run()
                        .then((res => log.debug("Plugin.run() finished with result: ", res)))
            }
        }))

const frontendSockets = new FrontendWebsocket(9991, StateMachineSingleton.getFull())

setInterval(() => true, 2000)
