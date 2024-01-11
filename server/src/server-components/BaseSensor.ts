const REQUIRED_IMPLEMENTATIONS = ["capabilities", "run", "end"]
export default class BaseSensor {
    private self;
    private api;
    constructor(name, activation = {
        interval: undefined,
        cron: undefined, /* *TODO*
      1 2 3 4 5 6 7
      ┬ ┬ ┬ ┬ ┬ ┬ ┬
      │ │ │ │ │ │ └── year (optional)
      │ │ │ │ │ └──── day of week
      │ │ │ │ └────── month
      │ │ │ └──────── day of month
      │ │ └────────── hour
      │ └──────────── minute
      └────────────── second (optional)*/
        state: undefined, /* name of the state change to activate on */
    }, uuid = this._createUuid()) {
        if (this.constructor === BaseSensor) {
            throw new Error("BaseSensor is abstract and cannot be instantiated directly");
        }
        this.checkRequiredMethodsImplemented();
        this.self = {};
        this.self.name = name;
        this.self.activation = activation;
        this.self.uuid = uuid;
    }

    initialize(sensorApi) {
        this.api = sensorApi;
        if (typeof this.sensorInit === 'function') {
            this.sensorInit()
        }
        this.api.logger.info(`Sensor ${this.getName()} initialized`)
        return {
            success: true,
            error: {}
        };
    }

    sensorInit() {}
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

    getActivation() {
        return this.self.activation;
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

    checkRequiredMethodsImplemented() {
        const proto = Object.getPrototypeOf(this);
        const superProto = BaseSensor.prototype;

        const missing = REQUIRED_IMPLEMENTATIONS.find(name =>
            typeof superProto[name] === "function" && !proto.hasOwnProperty(name)
        );
        if (missing) throw new TypeError(`${this.constructor.name} needs to implement method(s):  [${missing}]`);
    }
}
