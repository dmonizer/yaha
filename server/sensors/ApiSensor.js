const fetch = require('node-fetch');

let stateFunc = undefined;
let proxyAgent= undefined;

const init = (sensorApi) => {
  stateFunc = sensorApi.setStateFunction;
  proxyAgent = sensorApi.proxyAgent;
  return {
    name: "APISENSOR",
    interval:5
  }
}

function randomIntBetween(min, max) {
  return Math.floor(Math.random() * (max - min + 1) + min);
}

const run = () => {
  stateFunc("Starting sensor run")
  fetch("https://reqres.in/api/users/"+randomIntBetween(1,6),{agent : proxyAgent})
    .then((result)=>result.ok?result.json():new Error(result.error()))
    .then(json=>stateFunc("User "+json.data.first_name + " " + json.data.last_name + " logged in."))
    .catch((err)=>console.log(err))
}
const end = () => {return "bye"}
module.exports = { init, run, end, name : "APISENSOR" }
