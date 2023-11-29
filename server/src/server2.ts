import PluginLoader from "./server-components/PluginLoader"

import {YAHA_CONFIGURATION} from "./server-components/model/configuration-constants";
const pluginLoader = new PluginLoader(YAHA_CONFIGURATION.PLUGIN_PATHS)

setInterval(() => true, 2000)
