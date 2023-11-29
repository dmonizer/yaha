"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.YAHA_CONFIGURATION = exports.IMPERIAL_UNITS = exports.METRIC_UNITS = void 0;
exports.METRIC_UNITS = {
    TEMPERATURE: {
        symbol: "C",
        name: "Celsius"
    },
    DISTANCE: {
        name: "SI"
    }
};
exports.IMPERIAL_UNITS = {
    TEMPERATURE: {
        symbol: "F",
        name: "Fahrenheit"
    },
    DISTANCE: {
        name: "Imperial"
    }
};
exports.YAHA_CONFIGURATION = {
    TEMPERATURE_UNITS: {
        key: "temp-units",
        ...exports.METRIC_UNITS.TEMPERATURE
    },
    DISTANCE_UNITS: {
        key: "distance-units",
        ...exports.METRIC_UNITS.DISTANCE
    },
    SENSOR_PATHS: ["/server/src/sensors/"],
    PLUGIN_PATHS: ["/Users/erik.suit/Development/personal/yaha/server/src/server-components/plugins"]
};
