# yaha

as it seems shape of my head is not meant for home assistant's yaml configuration, and you need to automate your home - what more reasonable solution there is than write your own tool, huh?

idea is to have 
 - a central server (typescript) running different sensors (TS) which load data from wherever (web, mqtt, bluetooth, whatnot) and publish state back to server.
 - same server has a rule set which it applies on the state changes - ie presence reported in a room, sun is down and it's before midnight - turn the light on.
 - separate backend component, which serves states as an REST(?) or websockets? to
 - frontend (of which there can be multiple then - web, app(s), console etc) 
 - (at least in the beginning) it has limited sensor hardware support - ie what Zigbee2Mqtt supports, Yaha supports.
 - - maybe use other "gateways"2Mqtt as well, such as:
   - https://github.com/devbis/ble2mqtt (or https://github.com/shmuelzon/esp32-ble2mqtt)
   - https://github.com/zwave-js/zwave-js-ui
   - https://docs.openmqttgateway.com/
   - https://github.com/SMerrony/daikin2mqtt
   - https://github.com/gysmo38/mitsubishi2MQTT
   - homebridge?
  - **Just Works**. Most important goal - should have decent UX, so (at least basics of operation) are understandable without IQ of 200 :)

 - might look @ https://electrolama.com/projects/zoe2/


# what's already there
- integration with Zigbee2Mqtt gets devices and advertised state changes from MQTT (currently hardcoded config)
- plugin interace is somewhat capable - both MQTT integration and WeatherSensor use it
   
# next up in TODO
- rework general plugin framework - make sensors be a subclass of generic plugins - DONE
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

- make statemachine and messageDistributor also plugins - probably not, uneccessary overhead

# How to install

git clone

yarn i

yarn run startServer


open frontend/index.html in browser.
