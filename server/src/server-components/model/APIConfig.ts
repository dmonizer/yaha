import StateMachine from "../StateMachine";

export interface APIConfig {
    createLogger: Function,
    state: StateMachine
    /*proxyAgent:HttpsProxyAgent,*/
}

export enum SensorCapability {
    DISCOVERY,
    EXTERNAL_CONNECTION,
    STATE_CONSUMER,
    STATE_PRODUCER
}

export type SensorCapabilities = SensorCapability[]
