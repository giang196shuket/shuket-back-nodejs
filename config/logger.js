const appRoot = require('app-root-path') 
const winston = require('winston');
require('winston-daily-rotate-file');
const { combine, timestamp, printf } = winston.format;
 
const logFormat = printf(info => {
    return `${info.timestamp} ${info.level}: ${info.message}`;
});

var logger = winston.createLogger({
    format: combine(
        timestamp({
            format: 'YYYY-MM-DD HH:mm:ss',
        }),
        logFormat,
    ),
    transports: [
        new (winston.transports.DailyRotateFile) ({
            level: 'info',
            filename: `${appRoot}/logs/info-%DATE%.log`,
            datePatten: 'YYYY-MM-DD-HH',
            maxsize: 1024,
            timestamp: function () {
                var timezone = time.currentTimezone
                var now = new time.Date()
                now.setTimezone(timezone)
                return now.toString()
            },
            maxFiles: 30, // Lưu tệp nhật ký có giá trị trong 30 ngày
            zippedArchive: true, 
        }),
        new (winston.transports.DailyRotateFile) ({
            level: 'error',
            filename: `${appRoot}/logs/error-%DATE%.log`,
            datePatten: 'YYYY-MM-DD-HH',
            maxsize: 1024,
            timestamp: function () {
                var timezone = time.currentTimezone
                var now = new time.Date()
                now.setTimezone(timezone)
                return now.toString()
            },
            maxFiles: 30, // Lưu tệp nhật ký có giá trị trong 30 ngày
            zippedArchive: true, 
        })
    ]
});

logger.stream = {
    write: function (message, encoding) {
        logger.info(message)
    }
}

logger.writeLog = function (logType, logMessage) {
    logger.log(logType, logMessage);
    // if (process.env.NODE_ENV != "production") 
    console.log(`[${logType}] ${logMessage}`);
}

module.exports = logger