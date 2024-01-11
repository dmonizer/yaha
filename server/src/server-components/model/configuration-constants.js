"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
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
    TEMPERATURE_UNITS: __assign({ key: "temp-units" }, exports.METRIC_UNITS.TEMPERATURE),
    DISTANCE_UNITS: __assign({ key: "distance-units" }, exports.METRIC_UNITS.DISTANCE),
    SENSOR_PATHS: ["/server/src/sensors/"],
    PLUGIN_PATHS: ["/Users/erik.suit/Development/personal/yaha/server/src/server-components/plugins"]
};
