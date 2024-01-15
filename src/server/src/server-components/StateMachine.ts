import MessageDistributor from "./MessageDistributor";

export interface IsolatedState {
    set: (arg0: any) => void;
    get: () => any,
    subscribe: (arg0: string, arg1: Function) => void,
    unsubscribe: (arg0: string) => void
}

export interface FullState {
    setState: (owner: string, state: object) => void;
    getLastState: (owner: string) => StateItem;
    subscribe: (owner: string, subscriber: Function) => void;
}

interface StateItem {
    state: object,
    timeStamp: number
}

class StateMachine {
    private states: Map<string, StateItem[]> = new Map<string, StateItem[]>();
    private messageDistributor;

    constructor(messageDistributor: MessageDistributor) {
        this.messageDistributor = messageDistributor;
    }

    stateItem = (state: object): StateItem => ({
        state,
        timeStamp: Date.now()
    })

    setState = (owner: string, state: object) => {
        const latestState = this.stateItem(state)
        this.states.get(owner)?.push(latestState)
        this.advertiseStateChange(owner, latestState)
    }

    getLastState = (owner: string) => {
        const states = this.states.get(owner)
        return states?.length ? states[states.length - 1]:this.stateItem({}) // TODO: probably not the best idea to return new state here
    }

    advertiseStateChange = (owner: string, lastState: StateItem) => {
        this.messageDistributor.distribute(owner, lastState)
    }

    subscribe(owner: string, subscriber: Function) {
        this.messageDistributor.addSubscriber(owner, subscriber)
    }

    public getFull(): FullState {
        return {
            setState: this.setState.bind(this),
            getLastState: this.getLastState.bind(this),
            subscribe: this.subscribe.bind(this)
        }
    }

    public getIsolated(forName: string): IsolatedState {
        return {
            get: () => this.getLastState(forName),
            set: (state) => this.setState(forName, state),
            subscribe: (owner: string, receiver: Function) => this.subscribe(owner, receiver),
            unsubscribe: (arg0: string) => "not implemented"
        }
    }
}

class StateMachineSingleton {
    private static stateMachine: StateMachine

    static get(messageDistributor?: MessageDistributor) {
        if (!this.stateMachine) {
            if (!messageDistributor) {
                throw new Error("MessageDistributor is required on first Singleton call")
            }
            this.stateMachine = new StateMachine(messageDistributor)
        }
        return this.stateMachine;
    }

    public static getIsolatedFor(name: string): IsolatedState {
        return this.stateMachine.getIsolated(name)
    }

    public static getFull(): FullState {
        return this.stateMachine.getFull()
    }
}

export default StateMachineSingleton;
