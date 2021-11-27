class BaseSensor {
  constructor(name, interval) {
    if (this.constructor === BaseSensor) {
      throw new Error("BaseSensor is abstract and cannot be instantiated directly");
    }
    this.self = {};
    this.self.name = name;
    this.self.interval = interval;
    this.self.uuid = "flksdjglkdjglkdsfjglksjfd"
  }
  initialize(sensorApi) {
    this.api = sensorApi;
    return { success: true, error: {} };
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
}

export default BaseSensor