const EventEmitter = require('events').EventEmitter;

function EventSender() {
    EventEmitter.apply(this, arguments);
}

EventSender.prototype = Object.create(EventEmitter.prototype);

Object.assign(EventSender.prototype, {
    sendNewConnectionEvent: function sendNewConnectionEvent(data) {
        data.event = 'new connection';
        this.emit('new connection', data);
    },

    sendLoginAttemptEvent: function sendLoginAttemptEvent(data) {
        data.event = 'login attempt';
        this.emit('login attempt', data);
    }
});

module.exports = EventSender;
