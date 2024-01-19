import {Logger} from "../server-components/utilities/logger";

const log = Logger("MqttEntity")

enum EntityOrigin {
    MQTT, LAN, WAN, BT, PLUGIN, HOMEASSISTANT, OTHER
}

enum EntityType {
    Coordinator = "Coordinator", EndDevice = "EndDevice",
}

interface EntityProperties {
    origin: EntityOrigin,
    batteryPowered: boolean,
    passive: boolean, // true - only for reading (ie motion sensor), false - supports changing state (ie bulb)
    location: string, // url-like string of where (if passive=false) the entity state can be changed (ie. mqtt://room/entity/set )
}

export class BaseEntity {
    id;
    entityOrigin: EntityOrigin
    _state: Map<any, any>;
    name = "";

    constructor(id: string, origin: EntityOrigin) {
        this.id = id;
        this.entityOrigin = origin;
        this._state = new Map<any, any>();
    }

    set state(state: Map<any, any>) {
        this._state = state;
    }

    private _props: EntityProperties = <EntityProperties>{};

    get props(): EntityProperties {
        return this._props;
    }

    set props(value: EntityProperties) {
        this._props = value;
    }

    /**
     * @param key - state key to adress
     * @param value - optional, if not present, method will return current value for the key
     */
    stateItem(key: any, value: any) {
        if (value) {
            this._state.set(key, value);
        } else if (this._state.has(key)) {
            return this._state.get(key)
        }
    }

    ui(forConfiguration: boolean = false) {
        if (forConfiguration) return true;
        // TODO: return tsx?
        return false;
    }
}

export class MqttEntity extends BaseEntity {
    date_code: string = "";
    definition: {
        description: string,
        exposes: Array<ExposeDefinition>;
    } = {description: "", exposes: new Array<ExposeDefinition>()}
    public friendly_name: string = "";
    public model: string = "";
    public temperature: number = -Infinity;
    public humidity: number = -Infinity;
    public configuration: Configuration = <Configuration>{};
    public interview_completed: boolean = false;
    public interviewing: boolean = false;
    public manufacturer: string = "";
    public model_id: string = "";
    public power_source: string = "";
    public supported: boolean = false;
    public type: EntityType = <EntityType>{};
    public disabled: boolean = false;
    public endpoints: Array<Endpoint> = new Array<Endpoint>;
    private ieee_address: string = "";
    private network_address: number = -Infinity;
    private features: Array<FeatureDefinition> = Array<FeatureDefinition>()

    constructor(ieeeAddress: string, networkAddress: number) {
        super(ieeeAddress, EntityOrigin.MQTT);
        this.ieee_address = ieeeAddress;
        this.network_address = networkAddress;
    }

    static ofMqttMessage(message: any) {
        // Create an empty instance of class
        const entity = new MqttEntity(message?.ieee_address, message?.network_address);
        // Parse the JSON string into a plain JavaScript object
        const jsonObject = (typeof message!=="object") ? JSON.parse(message):message;
        // Get a list of property names in the sensor class
        const sensorKeys = Object.keys(entity);
        // Get a list of property names in the JSON object
        const jsonKeys = Object.keys(jsonObject);

        // Check if there are any keys in the JSON object that are not in the sensor class
        const unknownKeys = jsonKeys.filter(key => !sensorKeys.includes(key));

        if (unknownKeys.length > 0) {
            log.warn(`The following keys from the JSON data are not defined in the MqttEntity class: ${unknownKeys.join(', ')}`);
        }

        // Copy the properties of the JSON object onto the sensor instance
        Object.assign(entity, jsonObject);
        return entity;
    }

}

interface Configuration {
    calibration: number;
    precision: number;
}

interface Endpoint {
    bindings: Array<string>,
    clusters: {
        input: Array<string>,
        output: Array<string>
    },
    configured_reportings: Array<string>,
    scenes: Array<string>
}

interface NamedLabeledTyped {
    description: string
    label: string,
    name: string,
    type: string
}

interface WithAccess {
    access: number
}
interface ExposeDefinition extends NamedLabeledTyped, WithAccess {
    property: string,
    unit: string,
    value_max?: number,
    value_min?: number,
    value_toggle?: string
    value_off?: string,
    value_on?: string,
    values?: Array<string>
}

interface FeatureDefinition extends NamedLabeledTyped, WithAccess {
    property: string,
    value_off: string,
    value_on: string
}

interface IHADevice {
    hw_version: string,
    identifiers: Array<string>
    manufacturer: string,
    model: string,
    name: string,
    sw_version: string
}

interface IHAOrigin {
    name: string,
    sw: string,
    url: string
}

export class HomeAssistantDevice extends BaseEntity {
    constructor(id: string) {
        super(id, EntityOrigin.HOMEASSISTANT);
    }
    static ofMqttHomeassistantMessage(message: any, topic:string) {
        // TODO: parse the topic
        const entity = new HomeAssistantDevice(message.object_id);
        const jsonObject = (typeof message!=="object") ? JSON.parse(message):message;
        const sensorKeys = Object.keys(entity);
        const jsonKeys = Object.keys(jsonObject);
        const unknownKeys = jsonKeys.filter(key => !sensorKeys.includes(key) && key !=="name");
        if (unknownKeys.length > 0) {
            entity.unknown_keys = unknownKeys
            log.warn(`The following keys from the JSON data are not defined in the HomeAssistantDevice class: ${unknownKeys.join(', ')}`);
        }
        Object.assign(entity, jsonObject);
        return entity;
    }
    unknown_keys : Array<string> = new Array<string>();
    device: IHADevice = <IHADevice>{};
    device_class: string = "";
    entity_category: string = "";
    object_id: string = "";

    origin: IHAOrigin = <IHAOrigin>{};
    payload_off: string = "";

    payload_on: string = "";
    state_topic: string = "";
    unique_id: string = "";
    value_template: string = "";
    availability: Array<IHAAvailability> = [];
    availability_mode: string = "";
    enabled_by_default: boolean = false;
    command_topic:string = "";
    command_template:string = "";
    payload_press:string = "";
    options : Array<string> = [];
    icon:string = "";
    json_attributes_template:string = "";
    json_attributes_topic:string = "";
    unit_of_measurement:string = "";
    state_class:string = "";
    payload_lock:string="";
    payload_unlock:string="";
    state_locked:string="";
    state_unlocked:string="";
    action_template:string="";
    action_topic:string="";
    current_temperature_template:string="";
    current_temperature_topic:string="";
    max_temp:string="";
    min_temp:string="";
    mode_command_topic:string="";
    mode_state_template:string="";
    mode_state_topic:string="";
    modes:Array<string> = Array<string>();
    temp_step:number=-Infinity;
    temperature_command_topic:string="";
    temperature_state_template:string="";
    temperature_state_topic:string="";
    temperature_unit:string="";
    max:number=-Infinity;
    min:number=-Infinity;
    step:number=-Infinity;
    entity_picture:string="";
    latest_version_template:string="";
    latest_version_topic:string="";
    payload_install:string="";

}

interface IHAAvailability {
    topic: string,
    value_template: string
}
