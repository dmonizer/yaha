import {getUuid} from "../utilities/utilities";
import {Logger} from "../utilities/logger";
import {SensorInitResult, Sensor} from "./PluginInterfaces";
import {ActivationConfiguration, SensorAPI} from "./SensorInterfaces";
import {BasePlugin} from "./BasePlugin";

const log = Logger('BaseSensor')
export default abstract class BaseSensor extends BasePlugin implements Sensor {
    protected api: SensorAPI = <SensorAPI>{};
    private readonly activation: ActivationConfiguration;
    private readonly uuid: string;

    protected constructor(name: string, activation: ActivationConfiguration, uuid = getUuid(name)) {
        super(name)
        this.activation = activation;
        this.uuid = uuid;
    }

    initialize(sensorApi: SensorAPI): SensorInitResult {
        this.api = sensorApi;
        if (typeof this.sensorInit==='function') {
            this.sensorInit()
        }
        log.info(`Sensor ${this.getName()} initialized`)
        return {
            result: true,
            activation: this.activation
        };
    }

    sensorInit() {
        // this can but does not need to be implemented if the sensor doesn't need any additional initialization
    }

    capabilities() {
        throw new Error("Method 'capabilities()' must be implemented.");
    }

    run() {
        throw new Error("Method 'run()' must be implemented.");
    }

    end() {
        throw new Error("Method 'end()' must be implemented.");
    }

    getName() {
        return this.name
    }

    getUuid() {
        return this.uuid;
    }

    getActivation() {
        return this.activation;
    }
}
