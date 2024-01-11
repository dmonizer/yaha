import {BasePlugin, PluginCapabilities, PluginClass, PluginInfo} from "../BasePlugin";
export default class DemoPlugin extends BasePlugin {
    constructor() {
        super();
    }
    init(): PluginInfo {
        return {
            author: "Erik Suit",
            name: "demo_plugin",
            documentationUrl: "https://github.com/dmonizer/yaha",
            organization: "yaha.org",
            version: {major: 0, minor: 0, patch: 1},
            capabilities: new Set<PluginCapabilities>([PluginCapabilities.USER_CONFIGURABLE]),
            pluginClass: PluginClass.SENSOR
        }
    }

    run(): any {
        return "";
    }
}
