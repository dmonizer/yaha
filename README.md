# yaha

as it seems shape of my head is not meant for home assistant's yaml configuration, and you need to automate your home - what more reasonable solution there is than write your own tool, huh?

idea is to have 
 - a central server (js) running different sensors (js) which load data from wherever (web, mqtt, bluetooth, whatnot) and publish state back to server.
 - separate backend component, which serves states as an REST(?) or websockets? to
 - frontend (of which there can be multiple then - web, app(s), console etc)

# next up in TODO
- rework general plugin framework - make sensors be a subclass of generic plugins
  - make plugins return class (sensor/plugin/etc), name, author, organization, version, capabilities nad documentation url

```typescript
interface PluginInitData {
    pluginClass : PluginClass,  
    name : String,
    author: String,
    organization : String,
    documentationUrl : String,
    version : { major : Number, minor : Number, patch : Number},
    capabilitie : Set<PluginCapabilities>     
}
```
  - make plugin calling class://name.author.org/method/parameters
  - create tests for plugins to adhere to "standard", ie all fields correctly returned on init, version as a semver etc
- make statemachine and messageDistributor also plugins

# How to install

git clone

npm i

npm run startServer


open frontend/index.html in browser.
