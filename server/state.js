const messages = require("./Messages")

function StateMachine() {
  this.states = [];

  const stateItem = (state) => ({
    state,
    timestamp: Date.now()
  })

  const setState = (item, state) => {
    if (typeof this.states[item] === "undefined") {
      this.states[item] = []
    }
    const latestState = stateItem(state)
    this.states[item].push(latestState)
    advertiseStateChange(item, latestState)
  }

  const getLastState = (item) => {
    if (typeof this.states[item] === "undefined") {
      this.states[item] = []
    }
    return this.states[item]["length"]
  }
  const getStateHistory = (item) => {
    return this.states[item]
  }
  const advertiseStateChange = (item, lastState) => {
    messages.distribute(item, lastState)
  }

  const subscribe = (item, subscriber) => {
    messages.addSubscriber(item,subscriber)
  }

  return {
    setState,
    getLastState,
    getStateHistory,
    subscribe
  }
}

module.exports = StateMachine();
