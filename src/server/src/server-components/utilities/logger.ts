import MessageDistributorSingleton from "../MessageDistributor";

export enum LogLevel {
    TRACE = 1, DEBUG = 2, INFO = 3, WARN = 4, ERROR = 5
}

export interface Log {
    warn: (...args: any[]) => void;
    trace: (...args: any[]) => void;
    debug: (...args: any[]) => void;
    error: (...args: any[]) => void;
    info: (...args: any[]) => void
}

class LoggerMachine {
    private static activeLevel: LogLevel;
    private static initialized = false;
    private static initializing = false;

    static init() {
        LoggerMachine.initializing = true;
        const setLevel = process.env?.LOGLEVEL?.toUpperCase() || 'INFO'
        LoggerMachine.activeLevel = LogLevel[setLevel as keyof typeof LogLevel] || LogLevel.INFO;
        MessageDistributorSingleton.getInstance().addSubscriber("LogLevel", LoggerMachine.logLevelListener)
        LoggerMachine.initialized = true
        LoggerMachine.initializing = false;
    }

    public static get(logSource: string) {
        if (!LoggerMachine.initializing && !LoggerMachine.initialized) {
            LoggerMachine.init();
        }

        return {
            trace: LoggerMachine.getLoggerFor(logSource, LogLevel.TRACE),
            debug: LoggerMachine.getLoggerFor(logSource, LogLevel.DEBUG),
            info: LoggerMachine.getLoggerFor(logSource, LogLevel.INFO),
            warn: LoggerMachine.getLoggerFor(logSource, LogLevel.WARN),
            error: LoggerMachine.getLoggerFor(logSource, LogLevel.ERROR)
        }
    }

    private static logLevelListener(msg: any) {
        if (msg.level!==LoggerMachine.activeLevel) {
            LoggerMachine.writeLog("Logger", LogLevel.INFO, `Received new log level: ${LogLevel[msg.level]}`)
            LoggerMachine.activeLevel = LogLevel[msg.level] ? msg.level:LogLevel.INFO;
        }
    }

    private static formatDateTime() {
        return new Intl.DateTimeFormat('en-GB', {
            dateStyle: 'short', timeStyle: 'long', timeZone: 'UTC',
        }).format(new Date())
    }

    private static stringify(object: any) { // TODO: not working correctly - should enumerate class properties, instead currently returns {} for some (? ie loaded plugin) classes (need to detect constructor presence accurately)
        return JSON.stringify(object);
        // if (typeof object !== 'object') return JSON.stringify(object)
        // if (!object.default || object.constructor.name === "string" || object.constructor.name === "Object") return JSON.stringify(object)
        // const className = object.constructor.name;
        // const classProperties = Object.getOwnPropertyNames(object).map(propertyName =>{propertyName:object[propertyName]})
        // const classDescriptor = Object.getOwnPropertyDescriptors(object);
        // return JSON.stringify( { className, classProperties, classDescriptor } );
    }

    private static writeLog(source: string, level: LogLevel, ...args: any[]) {
        if (level.valueOf() >= LoggerMachine.activeLevel.valueOf()) {
            const argumentsAsStrings = Array.from(args).map(arg => LoggerMachine.stringify(arg));

            console.log(`[${source}] - [${LogLevel[level.valueOf()]}] - ${LoggerMachine.formatDateTime()} - ${argumentsAsStrings.join(' - ')}`)
        }
    }

    private static getLoggerFor(logSource: string, level: LogLevel) {
        return (...args: any[]) => LoggerMachine.writeLog(logSource, level, ...args)
    }
}

export const Logger = (logSource: string) => LoggerMachine.get(logSource)
