const fs = require('fs');

const LOGGER = require('@calzoneman/jsli').LoggerFactory.getLogger('JSONFileReporter');

function JSONFileReporter(options) {
    this.writeStream = fs.createWriteStream(options.filename, {
        flag: options.fileFlags
    });
    this.eventEmitter = options.eventEmitter;

    this.eventEmitter.on('new connection', this._writeEvent.bind(this));
    this.eventEmitter.on('login attempt', this._writeEvent.bind(this));
}

JSONFileReporter.prototype = {
    _writeEvent: function _writeEvent(event) {
        try {
            this.writeStream.write(JSON.stringify(event) + '\n');
        } catch (error) {
            LOGGER.error('Unable to write event: %s', error.stack);
        }
    }
};

module.exports = JSONFileReporter;
