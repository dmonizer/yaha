function Messages() {
  this.messageTypes = []
  const addSubscriber = (messageType, subscriber) => {
    if (typeof this.messageTypes[messageType] === "undefined") {
      this.messageTypes[messageType] = [];
    }
    this.messageTypes[messageType].push(subscriber)
  }
  const hasSubscribers = (messageType) => {
    return (typeof this.messageTypes[messageType] !== "undefined") && (this.messageTypes[messageType].length > 0);
  }
  const distribute = (messageType, message) => {
    if (hasSubscribers(messageType)) {
      this.messageTypes[messageType].map(subscriber => (typeof subscriber === "function") ? subscriber(message) : false)
    }
  }
  return {
    addSubscriber,
    distribute
  }
}

module.exports = Messages();
