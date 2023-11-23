export default class StateMachine {
    constructor(config, messageDistributor) {
        this.states = [];
        this.messageDistributor = messageDistributor;
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
        const stateItemCount = this.states[item].length;
        if (stateItemCount>0) {
            return this.states[item][stateItemCount - 1]
        }
    }
    getStateHistory = (item) => {
        return this.states[item]
    }
    advertiseStateChange = (item, lastState) => {
        this.messageDistributor.distribute(item, lastState)
    }

    subscribe = (item, subscriber) => {
        this.messageDistributor.addSubscriber(item, subscriber)
    }

}
