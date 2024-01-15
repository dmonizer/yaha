import process from "process";
import {BasePlugin} from "../model/BasePlugin";
import {PluginsConfig} from "../model/PluginInterfaces";
import {Logger} from "./logger";
import {globSync} from "glob";
import {ensureTrailingSlash} from "./utilities";
import path from "node:path";

const log = Logger("PluginManager")

export class PluginManager {
    public name: string = "PluginManager"
    private config: PluginsConfig;
    private detectedEnv: { ext: string; isTsNode: boolean; codePath: string; isTypescript: boolean };
    private _loadedPlugins: BasePlugin[] = new Array<BasePlugin>();
    private initialized: boolean = false

    public constructor(config: PluginsConfig) {
        this.config = config;
        this.detectedEnv = this.detectEnvironment();
        this.initialize().then(() => {
            log.info(`${this.name} initialization done`)
        })
    }

    loadedPlugins(): Promise<BasePlugin[]> {
        return new Promise((resolve, reject) => {
            const sleep = () => {
                if (!this.initialized) {
                    log.trace("not yet initialized, sleeping some");
                    setTimeout(sleep, 10)
                } else {
                    log.trace("initialized, resolving");
                    return resolve(this._loadedPlugins)
                }
            }
            sleep()
        })
    }

    private async initialize() {
        log.info(`${this.name} intializing`)
        log.debug("Using plugins configuration ", this.config)
        const locations = this.findAllPlugins(this.config.pluginLocations)
        this._loadedPlugins = await this.loadPlugins(locations);
        this.initialized = true;
    }

    private async loadPlugins(plugins: string[]): Promise<BasePlugin[]> {
        const loadedPlugins = new Array<BasePlugin>();
        log.debug("Working in: ", process.cwd())
        for (let pluginName of plugins) {
            log.info(`Loading plugin ${pluginName} ...`)
            loadedPlugins.push(await this.loadSinglePlugin(pluginName))
        }
        return loadedPlugins
    }

    private async loadSinglePlugin(pluginFile: string): Promise<BasePlugin> {
        const pluginName = path.basename(pluginFile).split('.')[0] || "default";
        log.trace(`Loading plugin "${pluginName}" from ${pluginFile}`)
        const importedPlugin = (await import(pluginFile).then((loaded) => {
            log.trace("Loaded:", loaded)
            return loaded[pluginName] ||loaded.default
        }))

        return new importedPlugin(pluginFile)
    }

    private expandPluginName(plugin: string): string {
        return process.cwd() + this.detectedEnv.codePath + plugin + this.detectedEnv.ext
    }

    private async registerPlugins(loadedPlugins: BasePlugin[]) {
        loadedPlugins.map((plugin) => plugin.register())
    }

    private detectEnvironment() {
        // @ts-ignore
        const isTsNode = () => process[Symbol.for("ts-node.register.instance")]!=null;
        // @ts-ignore
        const isTypescript = () => __filename.indexOf('.ts')===__filename.length - 3;

        return {
            cwd: process.cwd(),
            isTypescript: isTypescript(),
            isTsNode: isTsNode(),
            ext: isTypescript() ? '.ts':'.js',
            codePath: isTypescript() ? (isTsNode() ? '/':"/"):'/dist/'
        }
    }

    private findAllPlugins(pluginLocations: string[]) {
        return pluginLocations.map((location) => {
            const path = process.cwd() + ensureTrailingSlash(location) + '*' + this.detectedEnv.ext;
            const filesFound = globSync(path)
            log.debug(`In ${path} found files: ${filesFound}`)
            return filesFound
        }).flat()
    }
}
