var Logger = require('@calzoneman/jsli').Logger;
var LoggerFactory = require('@calzoneman/jsli').LoggerFactory;

var SLICE = [].slice;

function ConsoleLogger(level, logName) {
    Logger.apply(this, arguments);
}

ConsoleLogger.prototype = Object.create(Logger.prototype);

Object.assign(ConsoleLogger.prototype, {
    log: function log(level, message /*, ...args */) {
        var args = SLICE.call(arguments);
        args.shift();
        args.shift();
        var time = new Date().toISOString();
        var prefix = this.loggerName !== null ? (' (' + this.loggerName + ')') : '';
        prefix = time + ' - ' + level.name + prefix + ': ';
        args.unshift(prefix + message);
        console.log.apply(console, args);
    }
});

function ConsoleLoggerFactory(level) {
    this.level = level;
}

Object.assign(ConsoleLoggerFactory.prototype, {
    getLogger: function getLogger(loggerName) {
        return new ConsoleLogger(this.level, loggerName);
    }
});

exports.initialize = function initialize(level) {
    LoggerFactory.setLoggerImplFactory(new ConsoleLoggerFactory(level));
};
