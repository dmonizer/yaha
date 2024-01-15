const fetch = require('node-fetch');
const name = "APISENSOR";
const uuid = "{apiSensor_c_me_myself_and_i}";

let api = {}

const register = () => {
  return {
    name,
    uuid,
    interval: 5
  }
}

const initialize = (sensorApi) => {
  // get setState, proxyAgent and config
  api = sensorApi;
  api.config.set("url", "https://reqres.in/api/users/") // illustrating configuration saving.
  return {initSuccess: true, error:""}; // initialization successful
}

function randomIntBetween(min, max) {
  return Math.floor(Math.random() * (max - min + 1) + min);
}

const run = () => {
  api.setState("Starting sensor run")
  fetch(api.config.get("url") + randomIntBetween(1, 6), {agent: api.proxyAgent})
    .then((result) => result.ok ? result.json() : new Error(result.error()))
    .then(json => api.setState("User " + json.data.first_name + " " + json.data.last_name + " logged in."))
    .catch((err) => console.log(err))
}
const end = () => {
  return "bye"
}
module.exports = {register, initialize, run, end, name, uuid}
