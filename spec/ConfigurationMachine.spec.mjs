import ConfigurationMachine from "../server/src/server-components/ConfigurationStore.js";

describe("ConfigurationMachine", function () {
    const createLoggerMock = () => ({
        info : ()=>{},
        debug : ()=>{}
    })

    it("can be created", function () {
        expect(() => new ConfigurationMachine(createLoggerMock)).not.toThrowError();
    });
    it ("creates configuration for component",function() {
        const confMachine = new ConfigurationMachine(createLoggerMock);
        const result = confMachine.getConfiguratorFor("1234");
        expect(typeof result.get).toBe("function");
        expect(typeof result.set).toBe("function");
    })
    it ("configuration is saved for component",function() {
        const confMachine = new ConfigurationMachine(createLoggerMock);
        const result = confMachine.getConfiguratorFor("1234");
        result.set("name","value")
        expect(result.get("name")).toBe("value");        
    })
});
