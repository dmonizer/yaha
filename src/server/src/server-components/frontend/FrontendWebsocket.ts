import {MessageEvent, WebSocket, WebSocketServer} from 'ws';
import StateMachine, {FullState} from "../StateMachine";
import {Logger} from "../utilities/logger";

export default class FrontendWebsocket {
    private log;
    private wss;
    private stateMachine
    private connections: WebSocket[]
    private encoder;
    private decoder;

    constructor(port: number, state: FullState) {
        this.log = Logger("FrontEndWebsocket");
        const listeningPort = port ? port:8080;
        this.wss = new WebSocketServer({port: listeningPort});
        this.stateMachine = state;
        this.connections = [];
        this.encoder = new TextEncoder()
        this.decoder = new TextDecoder()
        this.wss.on("connection", (socket, request) => {
            this.handleIncomingConnection(socket, request)
        })
    }

    handleIncomingConnection(ws: WebSocket, req: any) {
        this.log.info(`Incoming connection ${ws}`)
        this.connections.push(ws);
        ws.onmessage = (ev) => this.handleIncomingMessage(ev);
    }

    handleIncomingMessage(ev: MessageEvent) {
        this.log.info(`Incoming message ${ev} : ${this.decoder.decode(ev.data as Buffer)}`)

        const {action, parameters} = JSON.parse(this.decoder.decode(ev.data as Buffer));
        if (action==='getState') {
            this.handleGetState(ev.target, parameters)
        } else if (action==='subscribe') {
            this.handleSubscribe(ev.target, parameters)
        }
    }

    send(data: Buffer) {

    }

    handleGetState(ws: WebSocket, parameters: any) {
        const {stateOwner} = parameters;
        const lastState = this.stateMachine.getLastState(stateOwner);
        if (lastState) {
            ws.send(this.encoder.encode(JSON.stringify(lastState)));
        }
    }

    createDistributor(stateOwner: string, ws: WebSocket) {
        const distributor = (messageContent:any) => {
            const message = {
                stateOwner,
                messageContent
            }

            const encodedMessage = this.encoder.encode(JSON.stringify(message));
            ws.send(encodedMessage);
        }
        return distributor.bind(this);
    }

    handleSubscribe(ws:WebSocket, parameters:any) {
        const {stateOwner} = parameters;
        this.stateMachine.subscribe(stateOwner, this.createDistributor(stateOwner, ws))
    }
}
