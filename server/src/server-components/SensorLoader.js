import glob from 'glob';
import path from 'path';

export default class SensorLoader {
  constructor(sensorsPath, sensorApi, configurationMachine) {
    this.sensorsPath = sensorsPath;
    this.sensorApi = sensorApi;
    this.configurationMachine = configurationMachine;
    this.state = sensorApi.state

    this.logger = sensorApi.createLogger("SensorLoader");
    this.logger.debug("Constructed SensorLoader")
    this.name = "sensors"
  }

  getName() {
    return this.name;
  }

  getFilename = (file) => {
    return path.basename(file)
  }

  loadAllSensors() {
    const sensors = [];
    const sensorFileSpec = this.sensorsPath + '*.js';
    this.logger.info("Loading sensors from: " + sensorFileSpec)
    sensors.push(glob.sync(sensorFileSpec).forEach(this.processSensorFile.bind(this)));
    this.logger.info(`Loaded ${sensors.length} sensors`)
    return sensors;
  }

  loadSensor = async (sensorFile) => {
    const {
      default: SensorClass
    } = await import(sensorFile)
    return new SensorClass();
  }

  processSensorFile(file) {
    this.logger.info("Processing sensor: " + file)
    const sensorFileName = this.getFilename(file);

    this.state.setState(this.name, {
      "loadsensor": true,
      "sensorname": sensorFileName
    });

    const sensorApi = {
      proxyAgent: this.proxyAgent,
      logger: this.logger,
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
      }
    }

    return this.loadSensor(this.sensorsPath + sensorFileName)
      .then(sensor => {
        sensorApi.state = {
          set: this.state.setState.bind(undefined, sensor.getName()),
          subscribe: this.state.subscribe,
          unsubscribe: this.state.unsubscribe
        }

        sensorApi.config = this.configurationMachine.getConfigurator(sensor.getUuid())

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
          setInterval(() => sensor.run(), sensor.getInterval() * 1000)
        }
        return sensor;
      }).catch(error => {
        this.logger.error("Error loading sensor: ", error)
      })
  }
}