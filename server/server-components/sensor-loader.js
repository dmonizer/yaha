const glob = require('glob');
const path = require('path');
const getFilename = (file) => {
  return path.basename(file)
}

const checkSensor = (sensorFile) => {
  const sensor = require(sensorFile)
  return (sensor && sensor.run && sensor.init && sensor.end && sensor.name)
}

const loadSensors = (config) => {
  const {logger, stateMachine, proxyAgent} = config;
  const sensors = [];
  const sensorFileSpec =  config.sensorsPath + '*.js';
  logger.info("Loading sensors from: " + sensorFileSpec)
  glob.sync(sensorFileSpec).forEach(function(file) {
    logger.info("Found sensor: " + file)
    const sensorFileName = getFilename(file);
    stateMachine.setState("sensors", {"loadsensor": true, "sensorname": sensorFileName});

    if (!checkSensor(config.sensorsPath + sensorFileName)) {
      logger.error("Error loading sensor: " + sensorFileName)
      stateMachine.setState("sensors", {"initsensor": false, sensorname: sensorFileName, "error": "Error loading sensor"})
      return
    }
    const sensor = require(config.sensorsPath + sensorFileName)
    const sensorApi = {
      proxyAgent,
      setStateFunction: stateMachine.setState.bind(sensor.name),
      logger
    }
    const sensorInit = sensor.init(sensorApi);
    logger.info("Sensor init successful", sensorInit)
    sensors[sensorInit.name] = sensor;
    setInterval(() => sensor.run(), sensorInit.interval * 1000)
    stateMachine.setState("sensors", {"initsensor": true, sensorname: file, "initresult": sensorInit})
  });
  return sensors;
}

module.exports = loadSensors
