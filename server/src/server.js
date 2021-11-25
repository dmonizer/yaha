const config = {
  sensorsPath: process.cwd() + "\\server\\sensors\\"
}
const ProxyAgent = require('https-proxy-agent')
const stateMachine = require("./state")
const proxyAgent = new ProxyAgent('http://10.7.253.20:8080');
const logger = require("./server-components/logging")
const sensorLoader = require("./server-components/sensor-loader")

logger.info("Logging initialized")

config.logger = logger;
config.stateMachine = stateMachine;
config.proxyAgent = proxyAgent;

const sensors = sensorLoader(config, logger)


stateMachine.subscribe("sensors", (state) => {
  console.log("received SENSOR-STATE-CHANGE: ", state)
})

stateMachine.subscribe("APISENSOR", (state) => {
  console.log("received API-STATE-CHANGE: ", state)
})

setInterval(() => true, 2000)
