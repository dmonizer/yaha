import {Logger} from "../utilities/logger";
import {IsolatedApiConfigBase} from "./ApiConfigBase";


export enum PluginCapabilities {
    EXTERNAL_CONNECTION,
    STATE_PRODUCER,
    USER_CONFIGURABLE,
    FRONTEND_DIRECT, // ?? plugin can be directly called by frontend
    SCHEDULED_RUN
}

export interface PluginInfo {
    name: string,
    author: string,
    organization: string,
    documentationUrl: string,
    version: { major: number, minor: number, patch: number },
}

const log = Logger("BasePlugin")

export class BasePlugin {
    protected _name: string = "";
    private _api: IsolatedApiConfigBase = <IsolatedApiConfigBase>{}

    constructor(name: string) {
        this._name = name;
    }

    get name(): string {
        return this._name;
    }

    get api(): IsolatedApiConfigBase {
        return this._api;
    }

    set api(value: IsolatedApiConfigBase) {
        this._api = value;
    }

    public register() {
        log.debug(`Registering ${this.name}`)
    }
}
