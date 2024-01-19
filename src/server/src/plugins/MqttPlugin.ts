import {BasePlugin, PluginInfo} from "../server-components/model/BasePlugin";
import * as mqtt from "mqtt"
import {IPublishPacket, OnMessageCallback} from "mqtt"
import {Logger} from "../server-components/utilities/logger";
import {HomeAssistantDevice, MqttEntity} from "../model/BaseEntity";
import StateMachineSingleton, {FullState} from "../server-components/StateMachine";

const log = Logger("MqttPlugin")

export default class MqttPlugin extends BasePlugin {
    converters: any;
    rootTopics = ["zigbee2mqtt/", "discovery/"];
    messageHandlers: Map<string, OnMessageCallback> = new Map();
    private state: FullState;

    constructor() {
        super("MqttPlugin");
        this.state = StateMachineSingleton.getFull();
        this.init()
    }

    init(): PluginInfo {

        this.messageHandlers.set('bridge/state', this.bridgeMessagesHandler.bind(this))
        this.messageHandlers.set('bridge/info', this.bridgeMessagesHandler.bind(this))
        this.messageHandlers.set('bridge/devices', this.bridgeDeviceMessagesHandler.bind(this))
        this.messageHandlers.set('bridge/groups', this.bridgeMessagesHandler.bind(this))
        this.messageHandlers.set('bridge/extensions', this.bridgeMessagesHandler.bind(this))
        this.messageHandlers.set('bridge/logging', this.bridgeMessagesHandler.bind(this))
        this.messageHandlers.set('discovery/', this.discoveryHandler.bind(this))
        this.messageHandlers.set('default', this.stateChangeMessage.bind(this))
        this.messageHandlers.set('', (topic, payload) => {
            log.debug(`Received UNHANDLED MQTT to ${topic}, message ${payload.toString()}`)
        })

        return {
            author: "Erik Suit",
            name: "MqttPlugin",
            documentationUrl: "https://github.com/dmonizer/yaha",
            organization: "yaha.org",
            version: {major: 0, minor: 0, patch: 1},
        }
    }

    async run(): Promise<any> {

        const protocol = 'mqtt' // TODO: implement SSL and switch protocol to mqtts
        const host = '192.168.1.164'
        const port = '1883'
        const clientId = `mqtt_${Math.random().toString(16).slice(3)}`

        const connectUrl = `${protocol}://${host}:${port}`

        const client = mqtt.connect(connectUrl, {
            clientId, clean: true, connectTimeout: 4000,
            // username: 'user', // TODO: Obvious
            // password: 'pass',
            reconnectPeriod: 1000,
        })


        const topic = '#'

        client.on('connect', () => {
            log.debug('MQTT Connected')
            client.subscribe([topic], () => {
                log.info(`Subscribe to topic '${topic}'`)
            })
        })

        client.on('message', this.initialMessageHandler())
    }

    private initialMessageHandler() {
        return (topic:string, payload:Buffer, packet:IPublishPacket) => {
            let handlerSearchKey;
            if (topic.startsWith(this.rootTopics[0])) {
                topic = topic.slice(this.rootTopics[0].length, topic.length)
            }
            if (topic.startsWith(this.rootTopics[1])) {
                handlerSearchKey = this.rootTopics[1]
            } else {
                handlerSearchKey = topic;
            }
            const handler = this.messageHandlers.get(handlerSearchKey) || this.messageHandlers.get('default');
            if (handler) {
                const message = JSON.parse(payload.toString())
                handler(topic, message, packet)
            } else {
                log.error(`did not find handler for topic '${topic}`);
            }
        };
    }

    stateChangeMessage(topic: string, payload: any, packet: IPublishPacket) {
        log.debug(`Received STATE message to: ${topic}, message ${JSON.stringify(payload)}, broadcasting.`);
        this.state.setState(topic,payload);

    }

    discoveryHandler(topic: string, payload: any, packet: IPublishPacket) {
        this.api.entities.addEntity(HomeAssistantDevice.ofMqttHomeassistantMessage(payload, topic));
    }

    bridgeMessagesHandler(topic: string, payload: any) {
        log.trace(`Received BridgeMessage (${topic}): `, payload)
    }

    bridgeDeviceMessagesHandler(topic: string, payload: any) {
        for (let i in payload as Array<string>) {
            this.api.entities.addEntity(MqttEntity.ofMqttMessage(payload[i]))
            log.debug("MqttEntity created ")
        }
    }
}
