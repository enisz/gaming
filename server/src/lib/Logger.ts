import Log4js, { Configuration, Appender } from 'log4js';

const consoleAppender: Appender = {
    type: "stdout",
    layout: {
        type: "pattern",
        pattern: "%d{yyyy-MM-dd hh:mm:ss,SSS} [%[%p%]] (%f{1}:%l:%o) - %m"
    }
}

const fileAppender: Appender = {
    type: "dateFile",
    filename: "logs/server.log",
    pattern: ".yyyy-MM-dd",
    compress: true,
    daysToKeep: 5,
    keepFileExt: true,
    layout: {
        type: "pattern",
        pattern: "%d{yyyy-MM-dd hh:mm:ss,SSS} [%p] (%f{1}:%l:%o) - %m"
    }
}

const configuration: Configuration = {
    appenders: {
        consoleAppender: consoleAppender,
        fileAppender: fileAppender
    },

    categories: {
        default: {
            appenders: ["consoleAppender", "fileAppender"],
            enableCallStack: true,
            level: "debug"
        }
    }
};

export default Log4js.configure(configuration);