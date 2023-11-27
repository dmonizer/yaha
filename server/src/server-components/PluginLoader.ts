import glob from 'glob';

export default class PluginLoader {
    private loaded_plugins: BasePlugin[] = [];

    constructor(pluginPaths: string[]) {

        this.loadPlugins(pluginPaths);
    }

    private async loadPlugins(pluginPaths: string[]) {
        pluginPaths
                .map(path => this.loadPluginsFrom(path)
                        .map(async plugin => this.loaded_plugins.push(await plugin)))
    }

    private resolveWildcard(path: string): string[] {
        const pluginFile = this.ensureTrailingSlash(path) + '*.js';
        return glob.sync(pluginFile)
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
