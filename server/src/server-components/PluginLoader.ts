import {glob} from 'glob';
import {BasePlugin} from "./BasePlugin";
import {Logger} from "../logger";

const log = Logger('PluginLoader')
export default class PluginLoader {
    private loadedPlugins: Awaited<BasePlugin>[] = [];

    constructor(pluginPaths: string[]) {
        log.debug("Current dir: ",__dirname)
        log.debug("Plugin paths from configuration: ", pluginPaths)
        this.loadAllPlugins(this.resolveAllPluginFiles(pluginPaths))
        Promise.all(this.loadedPlugins).then(plugins => log.debug("Loaded plugins: ",plugins));
    }

    private resolveAllPluginFiles(pluginPaths: string[]) {
        return pluginPaths.map(pathSpec => this.resolveWildcard(pathSpec)).flatMap((item)=>item)
    }
    private async loadAllPlugins(pluginFiles: string[]) {
        log.debug("Loading plugins from: ",pluginFiles)

        pluginFiles
                .map(async path =>
                        this.loadedPlugins.push(await this.loadPlugin(path)))

    }

    private resolveWildcard(path: string): string[] {
        const pluginFile = this.ensureTrailingSlash(path) + '*.js';
        const retVal = glob.sync?.(pluginFile)
        if (!retVal) throw new Error("glob sync undefined for " + path)
        return retVal;
    }

    private async loadPlugin(filePath: string) {
        const plugin = await import(filePath)
        return await (new plugin.default() as BasePlugin);
    }

    private ensureTrailingSlash(path: string): string {
        return path[path.length - 1]==='/' ? path:path + '/'
    }

    public getLoadedPlugins(): Array<BasePlugin> {
        return this.loadedPlugins;
    }
}
