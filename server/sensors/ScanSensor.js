const portScanner = require('node-port-scanner');
const os = require('os');

class ScanSensor extends BaseSensor {
  constructor() {
    super("ScanSensor",150);
  }

  capabilities() {
    if (!this.api) {
      return {}
    }

    return {
      capabilities: this.api.capabilities.DISCOVERY
    }
  }
  run() {
    const networkInformation = os.networkInterfaces();
    console.log(networkInformation)
  }
  end() {

  }
}
