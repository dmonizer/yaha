import {SingleConfigurationStore} from "../ConfigurationStore";
import {IsolatedState} from "../StateMachine";
import {IsolatedApiConfigBase} from "./ApiConfigBase";
import {EntityManager} from "../EntityManager";

export type ActivationConfiguration = {
    interval: number;
}
export class SensorAPI implements IsolatedApiConfigBase{
    yahaSettings: SingleConfigurationStore;
    //  proxyAgent: Agent, // TODO: reimplement
    state: IsolatedState;
    config: SingleConfigurationStore;
    entities: EntityManager;

    constructor(yahaSettings:SingleConfigurationStore, state:IsolatedState, config:SingleConfigurationStore, entityManager:EntityManager) {
        this.yahaSettings = yahaSettings
        this.config = config
        this.state = state
        this.entities = entityManager;
    }
}
interface ActivationConfig { // TODO: replace ActivationConfiguration with this.
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
