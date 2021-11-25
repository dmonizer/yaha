class BaseSensor {
  constructor(name, interval) {
    if (this.constructor === BaseSensor) {
      throw new Error("BaseSensor is abstract and cannot be instantiated directly");
    }
    this.self = {};
    this.self.name = name;
    this.self.interval = interval;
  }
  initialize(sensorApi) {
    this.api = sensorApi;
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
}
