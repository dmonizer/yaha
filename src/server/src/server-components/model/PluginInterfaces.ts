import {ActivationConfiguration, SensorAPI} from "./SensorInterfaces";

enum ARGUMENTS_COUNT {
    zero, one, two
}

export interface Sensor {
    initialize(sensorApi : SensorAPI):SensorInitResult;
    sensorInit():void;
    run(): void;
    end(): void;
}

export interface SensorInitResult {
    result: boolean,
    activation: ActivationConfiguration,
    error?: {
        message: string
    }

}

export function isSensor<E extends object>(obj: E): obj is E & Sensor {
    return typeof (<Sensor>obj).initialize==='function' && (<Sensor>obj).initialize.length===ARGUMENTS_COUNT.one;
}

export interface Plugin {
    run(): Promise<any | void>;
}

export function isRunnable<E extends object>(obj: E): obj is E & Plugin {
    return typeof (<Plugin>obj).run==='function' && (<Plugin>obj).run.length===ARGUMENTS_COUNT.zero;
}


export interface PluginsConfig {
    pluginNames: string[],
    pluginLocations: string[]
}
