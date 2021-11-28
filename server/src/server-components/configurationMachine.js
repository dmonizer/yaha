
export default class ConfigurationMachine {
    constructor(createLogger) {
        this.configurationMap = []; // this will probably be some DB (mongo?)
        this.logger = createLogger('ConfigurationMachine')
        setInterval(() => console.log(JSON.stringify(this.configurationMap)), 3000)
    }

    getConfigurator(uuid) {
        this.configurationMap[uuid] = []
        return {
            get : this.get.bind(this,uuid),
            set : this.set.bind(this,uuid)
        }
    }
    get(uuid, name) {
        return this.configurationMap[uuid][name];
      }
      set(uuid, name, value) {        
        this.logger.debug("set",JSON.stringify({uuid, name, value}))
        this.configurationMap[uuid][name] = value;        
      }
}
