import {IsolatedState} from "../StateMachine";
import {EntityManager} from "../EntityManager";
import {SingleConfigurationStore} from "../ConfigurationStore";

export interface IsolatedApiConfigBase {
    state: IsolatedState
    entities: EntityManager
    config: SingleConfigurationStore
    /*proxyAgent:HttpsProxyAgent,*/
}
