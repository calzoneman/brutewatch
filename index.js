const LogLevel = require('@calzoneman/jsli').LogLevel;
const ConsoleLogger = require('./lib/consolelogger');
ConsoleLogger.initialize(LogLevel.INFO);

const TelnetServer = require('./lib/telnet/telnet-server');
const SSHServer = require('./lib/ssh/ssh-server');
const Webserver = require('./lib/web/webserver');
const WebsocketController = require('./lib/web/ws-controller');
const EventSender = require('./lib/event-sender');
const config = require('./config');

const eventSender = new EventSender();

if (config.telnet.enabled) {
    new TelnetServer({
        eventSender: eventSender
    }).listen(config.telnet.port, config.telnet.host);
}

if (config.ssh.enabled) {
    new SSHServer({
        eventSender: eventSender,
        hostKey: config.ssh.hostKey
    }).listen(config.ssh.port, config.ssh.host);
}

if (config.http.enabled) {
    const wsController = new WebsocketController({
        eventEmitter: eventSender
    });
    new Webserver({
        wsController: wsController
    }).listen(config.http.port, config.http.host);
}
