const glob = require('glob');

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
  const path = require('path');
  return path.basename(file)
}

const checkSensor = (sensorFile) => { // checks if sensor exports required methods

  const sensor = require(sensorFile)
  let error = "";

  if (!sensor) {
    error += "Cannot find/load sensor. Check for syntax errors and configuration location. "
  }
  else {
    if (!sensor.run) {
      error += "'run' method missing. "
    }
    if (!sensor.register) {
      error += "'register' method missing. "
    }
    if (!sensor.initialize) {
      error += "'initialize' method missing. "
    }
    if (!sensor.end) {
      error += "'end' method missing. "
    }
    if (!sensor.name) {
      error += "'name' property missing. "
    }
    if (!sensor.uuid) {
      error += "'uuid' property missing. "
    }
  }

  return (error === "") ? true : error + `Tried loading from ${sensorFile}.`;
}

const loadSensors = (config) => {
  const {logger, stateMachine, proxyAgent} = config;
  const sensors = [];
  const sensorFileSpec = config.sensorsPath + '*.js';
  logger.info("Loading sensors from: " + sensorFileSpec)
  glob.sync(sensorFileSpec).forEach(function(file) {
    logger.info("Found sensor: " + file)
    const sensorFileName = getFilename(file);
    stateMachine.setState("sensors", {"loadsensor": true, "sensorname": sensorFileName});
    const checkResult = checkSensor(config.sensorsPath + sensorFileName);
    if (checkResult !== true) {
      logger.error(`Error loading sensor: (${sensorFileName}) - ${checkResult}`)
      stateMachine.setState("sensors", {"initsensor": false, sensorname: sensorFileName, "error": "Error loading sensor"})
      return
    }
    const sensor = require(config.sensorsPath + sensorFileName)
    const sensorData = sensor.register()
    // should check sensorData.uuid uniqueness here
    const sensorApi = {
      proxyAgent,
      setState: stateMachine.setState.bind(undefined, sensor.name),
      config: configurationMachine(sensorData.uuid),
      logger
    }

    const sensorInit = sensor.initialize(sensorApi);
    if (!sensorInit.initSuccess) {
      logger.info("Error initializing sensor", sensorInit.error)
      stateMachine.setState("sensors", {"initsensor": false, sensorname: sensorFileName, "error": sensorInit.error})
    }
    else {
      sensors[sensorData.uuid] = sensor;
      setInterval(() => sensor.run(), sensorData.interval * 1000)
      stateMachine.setState("sensors", {"initsensor": true, sensorname: file, "initresult": true})
    }
  });

  return sensors;
}


module.exports = loadSensors
