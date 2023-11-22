import PortScanner from 'node-port-scanner';
import BaseSensor  from "../server-components/BaseSensor.js";
import os from 'os';

export default class ScanSensor extends BaseSensor {
    constructor() {
        super("ScanSensor",{interval: 150});
        //this.scanner = new Po
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

    }
    end() {    }
}
