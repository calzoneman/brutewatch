const net = require('net');

const LOGGER = require('@calzoneman/jsli').LoggerFactory.getLogger('TelnetServer');
const NULL_EMITTER = {
    emit: function(){}
};

function TelnetServer(options) {
    this.server = this._createServer();
    this.eventSender = options.eventSender || NULL_EMITTER;
    this.clientTimeout = options.clientTimeout || 30 * 1000;
}

TelnetServer.prototype = {
    listen: function listen() {
        LOGGER.info('Listening on :%d', arguments[0]);
        return this.server.listen.apply(this.server, arguments);
    },

    _createServer: function createServer() {
        return net.createServer(this._handleClient.bind(this));
    },

    _handleClient: function _handleClient(client) {
        const ip = client.remoteAddress;
        LOGGER.info('Accepted telnet connection from %s', ip);
        this.eventSender.sendNewConnectionEvent({
            time: new Date(),
            ip: ip,
            source: 'telnet',
            payload: {}
        });

        var state = 'waitUsername';
        var buffer = '';
        var username = '';
        var password = '';

        client.write('login:');
        client.on('data', data => {
            data = String(data);
            if (!/\r\n$/.test(data)) {
                return;
            }

            data = data.trim();
            switch (state) {
                case 'waitUsername': {
                    username = data;
                    LOGGER.debug('Got username "%s" from IP %s', username, ip);

                    client.write('Password:');
                    state = 'waitPassword';
                    break;
                }
                case 'waitPassword': {
                    password = data;
                    LOGGER.debug('Got password "%s" from IP %s', password, ip);
                    LOGGER.info('Login attempt from %s: user=%s password=%s',
                            ip, username, password);
                    this.eventSender.sendLoginAttemptEvent({
                        time: new Date(),
                        ip: ip,
                        source: 'telnet',
                        payload: {
                            username: username,
                            password: password
                        }
                    });

                    try {
                        client.end();
                    } catch (error) {
                        LOGGER.error('Failed to close socket %s: %s', ip, error);
                    } finally {
                        state = 'closed';
                    }
                    break;
                }
                default:
                    break;
            }
        });

        client.on('close', () => {
            LOGGER.info('Connection from %s closed', ip);
            state = 'closed';
        });

        client.on('error', error => {
            LOGGER.error('Error from client %s: %s', ip, error);
            state = 'error';
        });

        setTimeout(() => {
            if (state !== 'closed') {
                LOGGER.info('Connection from %s timed out (state=%s)', ip, state);
                try {
                    client.end();
                } catch (error) {
                    LOGGER.error('Failed to close socket %s: %s', ip, error);
                } finally {
                    state = 'closed';
                }
            }
        }, this.clientTimeout);
    }
};

module.exports = TelnetServer;
