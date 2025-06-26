import { createLogger, format, transports, addColors } from 'winston'; 
import 'winston-daily-rotate-file'; 

const { combine, timestamp, printf, colorize, align } = format;

addColors({
    error: 'red',
    warn: 'yellow',
    info: 'green',
    debug: 'blue'
});

const logFormat = printf(({ level, message, timestamp, stack }) => {
  return `${timestamp} [${level}] ${stack || message}`;
});

const logger = createLogger({
  level: 'info', 
  format: combine(
    timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
    logFormat
  ),
  transports: [
    new transports.Console({
      level: 'debug',
      format: combine(
        colorize(), 
        timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
        align(),
        logFormat
      ),
      handleExceptions: true, 
    }),
    new transports.DailyRotateFile({
      level: 'info', 
      filename: 'logs/application-%DATE%.log',
      datePattern: 'YYYY-MM-DD',
      zippedArchive: true,
      maxSize: '20m', 
      maxFiles: '14d', 
      handleExceptions: true,
      format: combine(
        timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
        logFormat
      )
    }),
    new transports.DailyRotateFile({
      level: 'error', 
      filename: 'logs/error-%DATE%.log',
      datePattern: 'YYYY-MM-DD',
      zippedArchive: true,
      maxSize: '20m',
      maxFiles: '30d',
      handleExceptions: true,
      format: combine(
        timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
        logFormat
      )
    })
  ],
  exceptionHandlers: [ 
    new transports.DailyRotateFile({
        filename: 'logs/exceptions-%DATE%.log',
        datePattern: 'YYYY-MM-DD',
        zippedArchive: true,
        maxSize: '20m',
        maxFiles: '7d'
    })
  ],
  rejectionHandlers: [ 
    new transports.DailyRotateFile({
        filename: 'logs/rejections-%DATE%.log',
        datePattern: 'YYYY-MM-DD',
        zippedArchive: true,
        maxSize: '20m',
        maxFiles: '7d'
    })
  ]
});

export default logger;