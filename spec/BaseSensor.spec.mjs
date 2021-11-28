import BaseSensor from "../server/src/server-components/BaseSensor.js";

describe("BaseSensor", function() {
  it("can not be created", function() {
    expect(()=>new BaseSensor()).toThrow();
  });
});
