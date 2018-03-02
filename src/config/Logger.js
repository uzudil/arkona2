export const LOGGERS = {}

export const getLogger = function(name) {
    if(LOGGERS[name] == null) {
        LOGGERS[name] = new Logger(name)
    }
    return LOGGERS[name]
}

export class Logger {

    constructor(name) {
        this.name = name
        this.enabled = true
    }

    log(message, context) {
        console.log(this.name + " - " + message, context)
    }

    warn(message, context) {
        console.warn(this.name + " - " + message, context)
    }

    error(message, context) {
        console.error(this.name + " - " + message, context)
    }
}
