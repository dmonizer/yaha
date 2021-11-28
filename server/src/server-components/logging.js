import winston from 'winston';

const createLogger = (component) => {
  const logger = winston
    .createLogger({
      level: process.env.LOGLEVEL ? process.env.LOGLEVEL : 'info',
      format: winston.format.json(),
      defaultMeta: {
        component: component
      },
      transports: [
        //
        // - Write all logs with level `error` and below to `error.log`
        // - Write all logs with level `info` and below to `combined.log`
        //
        //new winston.transports.File({ filename: 'error.log', level: 'error' }),
        new winston.transports.File({
          filename: 'combined.log'
        }),
      ],
    });

  if (process.env.NODE_ENV !== 'production') {
    logger.add(
      new winston.transports.Console({
        format: winston.format.simple(),
      }));
  }
  return logger
}
export default createLogger