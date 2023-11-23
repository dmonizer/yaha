import { WebSocketServer } from 'ws';

export default class FrontendWebsocket {
    constructor(port, stateMachine, logger) {
        this.log = logger;
        const listeningPort = port ? port : 8080;
        this.wss = new WebSocketServer({port : listeningPort});
        this.stateMachine = stateMachine;
        this.connections = [];
        this.encoder = new TextEncoder("utf-8")
        this.wss.on('connection', this.handleIncomingConnection.bind(this));
    }
    handleIncomingConnection(ws) {
        this.log.info(`Incoming connection ${ws}`)
        this.connections.push(ws);
        ws.on('message', this.handleIncomingMessage.bind(this, ws));
    }

    handleIncomingMessage(ws, data) {
        this.log.info(`Incoming message ${ws} : ${new TextDecoder("utf-8").decode(data)}`)

        const { action, parameters } = JSON.parse(new TextDecoder("utf-8").decode(data));
        if (action === 'getState') {
            this.handleGetState(ws, parameters)
        } else if (action === 'subscribe') {
            this.handleSubscribe(ws, parameters)
        }
    }
    send(data) {

    }

    handleGetState(ws, parameters) {
        const { stateOwner } = parameters;
        const lastState = this.stateMachine.getLastState(stateOwner);
        if (lastState) {
            const encoder = new TextEncoder("utf-8")
            ws.send(encoder.encode(JSON.stringify(lastState)));
        }
    }

    createDistributor(stateOwner, ws) {
        const distributor = (messageContent) => {
            const message = {
                stateOwner,
                messageContent
            }

            const encodedMessage = this.encoder.encode(JSON.stringify(message));
            ws.send(encodedMessage);
        }
        return distributor.bind(this);
    }
    handleSubscribe(ws, parameters) {
        const { stateOwner } = parameters;
        this.stateMachine.subscribe(stateOwner, this.createDistributor(stateOwner, ws))
    }
}
