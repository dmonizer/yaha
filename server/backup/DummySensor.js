const init = () => {
  return {
    name: "DUMMY SENSOR",
    interval: 2,
    id: "dummy123"
  }
}
let counter = 0;
const run = () => {
  console.log("DUMMY SENSOR", counter)
  return counter++
}
const end = () => {
  return "bye"
}

module.exports = {init, run, end}
