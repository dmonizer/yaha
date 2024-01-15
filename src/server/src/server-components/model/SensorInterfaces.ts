import {SingleConfigurationStore, SubscriberFunction} from "../ConfigurationStore";
import {IsolatedState} from "../StateMachine";



export type ActivationConfiguration = {
    interval: number;
}
export class SensorAPI {
    yahaSettings: SingleConfigurationStore;
    //  proxyAgent: Agent, // TODO: reimplement
    state: IsolatedState;
    config: SingleConfigurationStore;

    constructor(yahaSettings:SingleConfigurationStore, state:IsolatedState, config:SingleConfigurationStore) {
        this.yahaSettings = yahaSettings
        this.config = config
        this.state = state
    }
}
interface ActivationConfig {
    interval?: number;
    cron?: string;/*  TODO:
    1 2 3 4 5 6 7
    ┬ ┬ ┬ ┬ ┬ ┬ ┬
    │ │ │ │ │ │ └── year (optional)
    │ │ │ │ │ └──── day of week
    │ │ │ │ └────── month
    │ │ │ └──────── day of month
    │ │ └────────── hour
    │ └──────────── minute
    └────────────── second (optional)*/

    state?: string; /* name of the state change to activate on */
}
