import portScanner from 'node-port-scanner';
import os from 'os';
import BaseSensor from "../server-components/BaseSensor.js"

class ScanSensor extends BaseSensor {
  constructor() {
    super("ScanSensor", 60);
    this.multipliers = [0x1000000, 0x10000, 0x100, 1];
    this.x = y;
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
    const network = this._getNonInternalIpsAndNetMasks();
    
    console.log(network)
  }

  end() {
  }

  _getNonInternalIpsAndNetMasks() {
    const networkInformation = os.networkInterfaces();
    const list = []
    for (const interf in networkInformation) {
      for (const interfaceDescriptor in networkInformation[interf]) {
        const descriptorBlock = networkInformation[interf][interfaceDescriptor]
        if (!descriptorBlock.internal) {
          list.push({
            interface: interf,
            ip: descriptorBlock.address,
            cidr: descriptorBlock.cidr,
            range : this._cidr2range(descriptorBlock.cidr)
          });
        }
      }
    }
    return list;
  }

  _cidr2range(cidr) { // does not yet work correctly (*.*.1.18/24 gets range of *.*.1.18 - *.*.2.something. instead of .0 - .255)
    const offset = 1 << 32 - parseInt(cidr.slice(cidr.indexOf('/') + 1, cidr.length))
    const startIp = this._ip2long(cidr.slice(0, cidr.indexOf('/')))
    const endIp = startIp + offset;
    return [this._long2ip(startIp), this._long2ip(endIp)]
  }

  _ip2long(ip) {
      var longValue = 0;
    ip.split('.').forEach((part, i)=>       
        longValue += part * this.multipliers[i]
      );
      return longValue;
    }

  _long2ip(longValue) {
      return this.multipliers.map(function(multiplier) {
        return Math.floor((longValue % (multiplier * 0x100)) / multiplier);
      }).join('.');
    }
}
export default ScanSensor;