import glob from 'glob';
import path from 'path';
import {APIConfig, SensorCapabilities} from "./model/APIConfig";
import ConfigurationStore, {SingleConfigurationStore} from "./ConfigurationStore";
import {Agent} from "https";


export default class SensorLoader {
    private sensorsPaths;
    private sensorApi;
    private configurationSore;
    private instanceConfiguration;
    private state;
    private logger;
    private readonly name;

    constructor(sensorsPaths : string[], sensorApi:APIConfig, configurationStore:ConfigurationStore, instanceConfiguration : SingleConfigurationStore) {
        this.sensorsPaths = sensorsPaths;
        this.sensorApi = sensorApi;
        this.configurationSore = configurationStore;
        this.instanceConfiguration = instanceConfiguration;
        this.state = sensorApi.state

        this.logger = sensorApi.createLogger("SensorLoader");
        this.name = "SensorLoader"
    }

    getName() {
        return this.name;
    }

    getFilename = (file:string) => {
        return path.basename(file)
    }
    loadAllSensors = () => this.sensorsPaths.map(path => this.loadAllSensorsInDirectory(path))

    loadAllSensorsInDirectory(directory : string) {
        const sensors = [];
        const sensorFileSpec = directory + '*.js';
        this.logger.info("Loading sensors from: " + sensorFileSpec)
        sensors.push(glob.sync(sensorFileSpec).map(f => this.processSensorFile(directory,f)));

        return Promise.allSettled(sensors).then((result) => {
            this.logger.info(`Loaded ${result.length} sensors`)
            return result;
        });
    }

    loadSensor = async (sensorFile:string) => {
        this.logger.debug(`Loading sensor from ${sensorFile}`)
        const sensorModule = await import(sensorFile)
        try {
            if (typeof sensorModule.default !== 'function') {
                throw new Error("Sensor does not have default export (ie export default class SensorName extends BaseSensor)")
            }
            return new sensorModule.default();
        } catch (e) {
            this.logger.error(`Error loading sensor from ${sensorFile}: ${e}`)
        }

    }

    processSensorFile(path:string, file:string) {
        this.logger.info("Processing sensor: " + file)
        const sensorFileName = this.getFilename(file);

        this.state.setState(this.name, {
            "loadsensor": true,
            "sensorname": sensorFileName
        });

        interface SensorStateMachine {
            set: (arg0: string)=>void;
            get: (arg0: string) => any,
            subscribe: (arg0: string,arg1:  Function)=>void,
            unsubscribe: (arg0: string) => void
        }

        interface SensorAPI {
            yaha: {
                settings : SingleConfigurationStore
            },
          //  proxyAgent: Agent, // TODO: reimplement
            logger: Function,
            state: SensorStateMachine,
            config: SingleConfigurationStore,
            capabilities: SensorCapabilities,
            fileInfo : {
                name: string,
                path: string
            }
        }

        const makeStateMachine = (name : string) : SensorStateMachine => {
            return {
            set: (value : any) =>this.state.setState(name, value),
            get: () => this.state.getLastState(name),
            subscribe : (stateProducer: string, subscriber : Function) => this.state.subscribe(stateProducer, subscriber),
            unsubscribe : (stateProducer) => { throw new Error("Not implemented")}//this.state.unsubscribe(stateProducer)
            }
        }

        return this.loadSensor(path + sensorFileName)
            .then(sensor => {
                let sensorApi : SensorAPI = {
                    yaha : {
                        settings : this.instanceConfiguration
                    },
                    //proxyAgent : this.sensorApi.proxyAgent,
                    logger : this.sensorApi.createLogger(sensor.getName()),
                    state : makeStateMachine(sensor.getName()),
                    config : this.configurationSore.getConfiguratorFor(sensor.getUuid(), sensor.getName()),
                    capabilities:[],
                    fileInfo : {
                        name : sensorFileName,
                        path }
                }


                const sensorInitResult = sensor.initialize(sensorApi);

                if (!sensorInitResult.success) {
                    this.logger.error("Error initializing sensor", file, sensorInitResult.error)
                    this.state.setState(this.name, {
                        "loadSensor": true,
                        sensorFileName,
                        error: sensorInitResult.error
                    })
                } else {
                    this.state.setState(this.name, {
                        "loadSensor": true,
                        sensorFileName,
                        "success": true
                    })
                    if (sensor.getActivation().interval) {
                        this.logger.debug(`Setting ${sensor.getActivation().interval} seconds interval run for ${sensor.getName()}`)
                        setInterval(() => sensor.run(), sensor.getActivation().interval * 1000)
                    } else if (sensor.getActivation().cron) {
                        this.logger.warn("CRON interval activation not implemented yet.")
                    }
                }
                return sensor;
            }).catch(error => {
                this.logger.error("Error loading sensor: ", error)
            })
    }
}
