const LogLevel = require('@calzoneman/jsli').LogLevel;
const ConsoleLogger = require('./lib/consolelogger');
ConsoleLogger.initialize(LogLevel.INFO);

const TelnetServer = require('./lib/telnet/telnet-server');
const Webserver = require('./lib/web/webserver');
const WebsocketController = require('./lib/web/ws-controller');
const EventSender = require('./lib/event-sender');
const config = require('./config');

const eventSender = new EventSender();
new TelnetServer({
    eventSender: eventSender
}).listen(config.telnet.port, config.telnet.host);

new Webserver({
    wsController: new WebsocketController({ eventEmitter: eventSender })
}).listen(config.http.port, config.http.host);
