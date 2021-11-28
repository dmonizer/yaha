class BaseSensor {
  constructor(name, interval, uuid = this._createUuid()) {
    if (this.constructor === BaseSensor) {
      throw new Error("BaseSensor is abstract and cannot be instantiated directly");
    }
    this.self = {};
    this.self.name = name;
    this.self.interval = interval;
    this.self.uuid = uuid;
  }
  initialize(sensorApi) {
    this.api = sensorApi;
    this.api.logger.info(`Sensor ${this.getName()} initialized`)
    return {
      success: true,
      error: {}
    };
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
    return this.self.name
  }
  getUuid() {
    return this.self.uuid;
  }
  getInterval() {
    return this.self.interval;
  }

  _createUuid() {
    return [...Array(8).keys()].map(() => {
      let item = ""
      while (item.length < 4) {
        item += String.fromCharCode(65 + Math.random() * 10)
      }
      return item
    }).join('-')

  }
}

export default BaseSensor