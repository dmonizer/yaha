export enum PluginClass {
    SENSOR,
    PLUGIN,
    CORE
}

export enum PluginCapabilities {
    EXTERNAL_CONNECTION,
    STATE_PRODUCER,
    USER_CONFIGURABLE,
    FRONTEND_DIRECT, // ?? plugin can be directly called by frontend
    SCHEDULED_RUN
}

export interface PluginInfo {
    pluginClass: PluginClass,
    name: string,
    author: string,
    organization: string,
    documentationUrl: string,
    version: { major: number, minor: number, patch: number },
    capabilities: Set<PluginCapabilities>

}

export abstract class BasePlugin {
    abstract init() : PluginInfo;
    abstract run():any;
}
