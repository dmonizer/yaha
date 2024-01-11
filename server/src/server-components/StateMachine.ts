import ConfigurationStore from "./ConfigurationStore";
import MessageDistributor from "./MessageDistributor";

export default class StateMachine {
    private states: any[keyof string] = [];
    private messageDistributor;
    constructor(config : ConfigurationStore, messageDistributor: MessageDistributor) {
        this.messageDistributor = messageDistributor;
    }

    stateItem = (state:any) => ({
        state,
        timestamp: Date.now()
    })

    setState = (item:string, state:any) => {
        if (typeof this.states[item] === "undefined") {
            this.states[item] = []
        }
        const latestState = this.stateItem(state)
        this.states[item].push(latestState)
        this.advertiseStateChange(item, latestState)
    }

    getLastState = (item:string) => {
        if (typeof this.states[item] === "undefined") {
            this.states[item] = []
        }
        const stateItemCount = this.states[item].length;
        if (stateItemCount>0) {
            return this.states[item][stateItemCount - 1]
        }
    }
    getStateHistory = (item:string) => {
        return this.states[item]
    }
    advertiseStateChange = (item:string, lastState:any) => {
        this.messageDistributor.distribute(item, lastState)
    }

    public subscribe (item:string, subscriber : Function) {
        this.messageDistributor.addSubscriber(item, subscriber)
    }

}
