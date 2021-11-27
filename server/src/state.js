
class StateMachine {
  constructor(messages) {
    this.messages = messages;
    this.states = [];
  }

  stateItem = (state) => ({
    state,
    timestamp: Date.now()
  })

  setState = (item, state) => {
    if (typeof this.states[item] === "undefined") {
      this.states[item] = []
    }
    const latestState = this.stateItem(state)
    this.states[item].push(latestState)
    this.advertiseStateChange(item, latestState)
  }

  getLastState = (item) => {
    if (typeof this.states[item] === "undefined") {
      this.states[item] = []
    }
    return this.states[item]["length"]
  }
  getStateHistory = (item) => {
    return this.states[item]
  }
  advertiseStateChange = (item, lastState) => {
    this.messages.distribute(item, lastState)
  }

  subscribe = (item, subscriber) => {
    this.messages.addSubscriber(item, subscriber)
  }


  //  setState,
  //  getLastState,
  //  getStateHistory,
  //  subscribe

}

export default StateMachine ;
