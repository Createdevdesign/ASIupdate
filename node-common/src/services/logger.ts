import winston from 'winston'
import WinstonCloudWatch from 'winston-cloudwatch';

const levels = {
  error: 0,
  warn: 1,
  info: 2,
  http: 3,
  debug: 4,
}

const level = () => {
  const env = process.env.ENV || 'dev'
  const isDevelopment = env === 'dev'
  return isDevelopment ? 'debug' : 'warn'
}

const colors = {
  error: 'red',
  warn: 'yellow',
  info: 'green',
  http: 'magenta',
  debug: 'white',
}

winston.addColors(colors)

const format = winston.format.combine(
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss:ms' }),
  winston.format.colorize({ all: true }),
  winston.format.printf(
    (info) => `${info.timestamp} ${info.level}: ${info.message}`,
  ),
)

const transports = [
  new winston.transports.Console(),
  new winston.transports.File({
    filename: 'logs/error.log',
    level: 'error',
  }),
  new winston.transports.File({ filename: 'logs/all.log' }),
]

const Logger = winston.createLogger({
  level: level(),
  levels,
  format,
  transports,
})

console.log = function(){
    return Logger.info.apply(Logger, arguments)
  }
  console.error = function(){
    return Logger.error.apply(Logger, arguments)
  }
  console.info = function(){
    return Logger.warn.apply(Logger, arguments)
  }

if (process.env.ENV === 'prod' || process.env.ENV === 'dev') {
    Logger.add(new WinstonCloudWatch({
        name: "",
        logGroupName: process.env.CLOUDWATCH_GROUP_NAME,
        logStreamName: `${process.env.CLOUDWATCH_GROUP_NAME}-${process.env.ENV}`,
        messageFormatter: ({ level, message, additionalInfo }) =>    `[${level}] : ${message} \nAdditional Info: ${JSON.stringify(additionalInfo)}}`,
        jsonMessage: true
    }))
}

export default Logger