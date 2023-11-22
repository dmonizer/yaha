import glob from 'glob';
import path from 'path';


export default class SensorLoader {
    constructor(sensorsPaths, sensorApi, configurationMachine, instanceConfiguration) {
        this.sensorsPaths = sensorsPaths;
        this.sensorApi = sensorApi;
        this.configurationMachine = configurationMachine;
        this.instanceConfiguration = instanceConfiguration;
        this.state = sensorApi.state

        this.logger = sensorApi.createLogger("SensorLoader");
        this.name = "SensorLoader"
    }

    getName() {
        return this.name;
    }

    getFilename = (file) => {
        return path.basename(file)
    }
    loadAllSensors = () => this.sensorsPaths.map(path => this.loadAllSensorsInDirectory(path))

    loadAllSensorsInDirectory(directory) {
        const sensors = [];
        const sensorFileSpec = directory + '*.js';
        this.logger.info("Loading sensors from: " + sensorFileSpec)
        sensors.push(glob.sync(sensorFileSpec).map(this.processSensorFile.bind(this, directory)));

        return Promise.allSettled(sensors).then((result) => {
            this.logger.info(`Loaded ${result[0].value.length} sensors`)
        });
    }

    loadSensor = async (sensorFile) => {
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

    processSensorFile(path, file) {
        this.logger.info("Processing sensor: " + file)
        const sensorFileName = this.getFilename(file);

        this.state.setState(this.name, {
            "loadsensor": true,
            "sensorname": sensorFileName
        });

        const sensorApi = {
            yaha: {
                settings: this.instanceConfiguration
            },
            proxyAgent: this.proxyAgent,
            logger: null,
            state: {
                set: null,
                subscribe: null,
                unsubscribe: null
            },
            config: null,
            capabilities: {
                DISCOVERY: 1,
                EXTERNAL_CONNECTION: 2,
                STATE_CONSUMER: 3,
                STATE_PRODUCER: 4
            },

        }

        return this.loadSensor(path + sensorFileName)
            .then(sensor => {
                sensorApi.state = {
                    set: this.state.setState.bind(undefined, sensor.getName()),
                    subscribe: this.state.subscribe,
                    unsubscribe: this.state.unsubscribe
                }
                sensorApi.fileInfo = {
                    name: sensorFileName,
                    path: this.sensorsPath
                }

                sensorApi.config = this.configurationMachine.getConfiguratorFor(sensor.getUuid(), sensor.getName())
                sensorApi.logger = this.sensorApi.createLogger(sensor.getName())

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
