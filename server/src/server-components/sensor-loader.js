import glob from 'glob';
import fetch from 'node-fetch';
import path from 'path';
import { createRequire } from 'module';
const require = createRequire(import.meta.url);

const dummySensorConfigurationMap = [];
const configurationMachine = function(uuid) {
  dummySensorConfigurationMap[uuid] = []; // init config store for this uuid
  return {
    get: function(name) {
      return dummySensorConfigurationMap[uuid][name];
    },
    set: function(name, value) {
      dummySensorConfigurationMap[uuid][name] = value;
    }
  }
}

const getFilename = (file) => {
  return path.basename(file)
}

const loadSensor = async (sensorFile) => {
  const { default: sensorClass } = await import(sensorFile)
  const sensor = new sensorClass()
  return sensor;
}

const loadSensors = (config) => {
  const { logger, stateMachine, proxyAgent } = config;
  const sensors = [];
  const sensorFileSpec = config.sensorsPath + '*.js';
  logger.info("Loading sensors from: " + sensorFileSpec)
  glob.sync(sensorFileSpec).forEach(function(file) {
    logger.info("Found sensor: " + file)
    const sensorFileName = getFilename(file);
    stateMachine.setState("sensors", { "loadsensor": true, "sensorname": sensorFileName });

    const sensorApi = {
      proxyAgent,
      logger,
      capabilities: {
        DISCOVERY: 1,
        EXTERNAL_CONNECTION: 2,
        STATE_CONSUMER: 3,
        STATE_PRODUCER: 4
      }
    }
    const sensor = loadSensor(config.sensorsPath + sensorFileName)
      .then(sensor => {
        sensorApi.setState = stateMachine.setState.bind(undefined, sensor.getName());
        sensorApi.config = configurationMachine(sensor.getUuid())
        const sensorInitResult = sensor.initialize(sensorApi);
        if (!sensorInitResult.success) {
          logger.error("Error initializing sensor", sensorInitResult.error)
          stateMachine.setState("sensors", { "initsensor": false, sensorname: sensorFileName, "error": sensorInitResult.error })
        }
        else {
          sensors[sensor.getUuid()] = sensor;
          setInterval(() => sensor.run(), sensor.getInterval() * 1000)
          stateMachine.setState("sensors", { "initsensor": true, sensorname: file, "initresult": true })
        }
        return sensor;
      })



  });

  return sensors;
}


export default loadSensors
