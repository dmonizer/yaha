export const METRIC_UNITS = {
    TEMPERATURE : {
        symbol : "C",
        name : "Celsius"
    },
    DISTANCE : {
        name : "SI"
    }
}

export const IMPERIAL_UNITS = {
    TEMPERATURE : {
        symbol : "F",
        name : "Fahrenheit"
    },
    DISTANCE : {
        name : "Imperial"
    }
}

export const YAHA_CONFIGURATION = {
    TEMPERATURE_UNITS : {
        key : "temp-units",
        ...METRIC_UNITS.TEMPERATURE
    },
    DISTANCE_UNITS : {
        key: "distance-units",
        ...METRIC_UNITS.DISTANCE
    },
    SENSOR_PATHS : ["/server/src/sensors/"],
    PLUGIN_PATHS : ["/Users/erik.suit/Development/personal/yaha/server/src/server-components/plugins"]

}
