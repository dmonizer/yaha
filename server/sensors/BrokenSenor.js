const init = () => {
  return {name: "DUMMY SENSOR", interval:2}
}
let counter = 0;
const run = () => {
  console.log("DUMMY SENSOR",counter)
  return counter++
}
const end = () => {
  return "bye"
}

// this sensor does not export init method nor name, thus it is considered faulty and not loaded
module.exports = { run, end }
