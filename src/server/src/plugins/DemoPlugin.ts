import {BasePlugin, PluginInfo} from "../server-components/model/BasePlugin";
export default class DemoPlugin extends BasePlugin {
    constructor() {
        super("DemoPlugin");
    }
    init(): PluginInfo {
        return {
            author: "Erik Suit",
            name: "demo_plugin",
            documentationUrl: "https://github.com/dmonizer/yaha",
            organization: "yaha.org",
            version: {major: 0, minor: 0, patch: 1},
        }
    }

    async run() {
        return "";
    }
}
