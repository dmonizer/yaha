const config = {
  sensorsPath: process.cwd() + "/server/src/sensors/"
}
import ProxyAgent from "https-proxy-agent";
import StateMachine from "./state.js"
import Messages from "./Messages.js"
import logger from "./server-components/logging.js"
import sensorLoader from "./server-components/sensor-loader.js"

//const proxyAgent = new ProxyAgent('http://10.7.253.20:8080');

logger.info("Logging initialized")

config.logger = logger;
config.stateMachine = new StateMachine(new Messages());
//config.proxyAgent = proxyAgent;

const sensors = sensorLoader(config, logger)


config.stateMachine.subscribe("sensors", (state) => {
  console.log("received SENSOR-STATE-CHANGE: ", state)
})

config.stateMachine.subscribe("WeatherSensor", (state) => {
  console.log("received WeatherSensor API-STATE-CHANGE: ", state)
})

setInterval(() => console.log("."), 2000)
