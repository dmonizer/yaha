const METRIC_UNITS = {
    TEMPERATURE : {
        symbol : "C",
        name : "Celsius"
    },
    DISTANCE : {
        name : "SI"
    }
}

const IMPERIAL_UNITS = {
    TEMPERATURE : {
        symbol : "F",
        name : "Fahrenheit"
    },
    DISTANCE : {
        name : "Imperial"
    }
}

const YAHA_CONFIGURATION = {
        TEMPERATURE_UNITS : {
            key : "temp-units",
            ...METRIC_UNITS.TEMPERATURE
        },
        DISTANCE_UNITS : {
            key: "distance-units",
            ...METRIC_UNITS.DISTANCE
        },
    SENSOR_PATHS : ["/server/src/sensors/"]
}
export default YAHA_CONFIGURATION
