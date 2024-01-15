type LogLevel = string
const LOG_LEVELS: LogLevel[] = ['TRACE', 'DEBUG', 'INFO', 'WARN', 'ERROR']

export interface Log {
    warn: (...args: any[]) => void;
    trace: (...args: any[]) => void;
    debug: (...args: any[]) => void;
    error: (...args: any[]) => void;
    info: (...args: any[]) => void
}

export const Logger = (logSource: string) => {
    const ACTIVE_LEVEL = LOG_LEVELS.indexOf(process.env?.LOGLEVEL?.toUpperCase() || 'INFO')

    const formatDateTime = () => new Intl.DateTimeFormat('en-GB', {
        dateStyle: 'short', timeStyle: 'long', timeZone: 'UTC',
    }).format(new Date())

    const stringify = (object: any) : string =>{ // TODO: not working correctly - should enumerate class properties, instead currently returns {} for some (? ie loaded plugin) classes (need to detect constructor presence accurately)
        if (typeof object !== 'object') return JSON.stringify(object)
        if (!object.default || object.constructor.name === "string" || object.constructor.name === "Object") return JSON.stringify(object)
        const className = object.constructor.name;
        const classProperties = Object.getOwnPropertyNames(object).map(propertyName =>{propertyName:object[propertyName]})
        const classDescriptor = Object.getOwnPropertyDescriptors(object);
        return JSON.stringify( { className, classProperties, classDescriptor } );
    }
    function writeLog(source: string, level: LogLevel, ...args: any[]) {
        if (LOG_LEVELS.indexOf(level) >= ACTIVE_LEVEL) {
            const argumentsAsStrings = Array.from(args).map(arg => stringify(arg));

            console.log(`[${source}] - [${level}] - ${formatDateTime()} - ${argumentsAsStrings.join(' - ')}`)
        }
    }

    function getLoggerFor(level: LogLevel) {
        return (...args: any[]) => writeLog(logSource, level, ...args)
    }

    return {
        trace: getLoggerFor(LOG_LEVELS[0]),
        debug: getLoggerFor(LOG_LEVELS[1]),
        info: getLoggerFor(LOG_LEVELS[2]),
        warn: getLoggerFor(LOG_LEVELS[3]),
        error: getLoggerFor(LOG_LEVELS[4])

    }
}
