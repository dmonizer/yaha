import glob from 'glob';
import {BasePlugin} from "./plugins/BasePlugin";

export default class PluginLoader {
    private loaded_plugins: BasePlugin[] = [];

    constructor(pluginPaths: string[]) {
        console.log(__dirname)
        console.log(pluginPaths)
        this.loadPlugins(pluginPaths);
        console.log(this.loaded_plugins)
    }

    private async loadPlugins(pluginPaths: string[]) {
        pluginPaths
                .map(path => this.loadPluginsFrom(path)
                        .map(async plugin => this.loaded_plugins.push(await plugin)))
    }

    private resolveWildcard(path: string): string[] {
        const pluginFile = this.ensureTrailingSlash(path) + '*.js';
        const retVal = glob.sync(pluginFile)
        console.log(retVal)
        return retVal;
    }

    private loadPluginsFrom(pluginPath: string): Promise<BasePlugin>[] {
        return this.resolveWildcard(pluginPath)
                .map(this.initiatePlugin);
    }

    private async initiatePlugin(filePath: string): Promise<BasePlugin> {
        const plugin = await import(filePath)
        return new plugin.default() as BasePlugin;
    }

    private ensureTrailingSlash(path: string): string {
        return path[path.length - 1]==='/' ? path:path + '/'
    }
}
