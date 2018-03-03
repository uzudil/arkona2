export const LOGGERS = {}

export const getLogger = function(name) {
    if(LOGGERS[name] == null) {
        LOGGERS[name] = new Logger(name)
    }
    return LOGGERS[name]
}

export const toggleAll = function(enabled) {
    defaultEnabled = enabled
    for(let name in LOGGERS) {
        getLogger(name).enabled = enabled
    }
}

var defaultEnabled = true

export class Logger {

    constructor(name) {
        this.name = name
        this.enabled = defaultEnabled
    }

    log(message, context) {
        if(this.enabled) console.log(this.name + " - " + message, context || "")
    }

    warn(message, context) {
        if(this.enabled) console.warn(this.name + " - " + message, context || "")
    }

    error(message, context) {
        if(this.enabled) console.error(this.name + " - " + message, context || "")
    }
}
