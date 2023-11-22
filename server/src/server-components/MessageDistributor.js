export default class MessageDistributor {
    constructor(createLogger) {
        this.messageTypes = []
        this.logger = createLogger("MessageDistributor")
    }

    addSubscriber = (messageType, subscriber) => {
        if (typeof this.messageTypes[messageType] === "undefined") {
            this.messageTypes[messageType] = [];
        }
        this.messageTypes[messageType].push(subscriber)
    }
    hasSubscribers = (messageType) => {
        return (typeof this.messageTypes[messageType] !== "undefined") && (this.messageTypes[messageType].length > 0);
    }

    distribute = (messageType, message) => {
        if (this.hasSubscribers(messageType)) {
            this.messageTypes[messageType].map(subscriber => (typeof subscriber === "function") ? subscriber(message) : false)
        }
    }
}
