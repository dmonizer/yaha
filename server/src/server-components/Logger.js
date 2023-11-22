import winston from "winston";

export default class Logger {
    constructor() {
        this.logLevel = "info";
        this.logTransports = [new winston.transports.File({filename: 'combined.log'})]
        if (process.env.NODE_ENV !== 'production') {
            this.logLevel = "debug"
            this.logTransports.push(
                new winston.transports.Console({
                    format: winston.format.simple(),
                }))
        }
    }

    createLogger = (serviceName, logLevel) => {
        return winston
            .createLogger({
                level: logLevel ? logLevel : this.logLevel,
                format: winston.format.json(),
                defaultMeta: {service: serviceName},
                transports: this.logTransports
            })
    }
}
