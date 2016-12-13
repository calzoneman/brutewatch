const ssh2 = require('ssh2');

const LOGGER = require('@calzoneman/jsli').LoggerFactory.getLogger('SSHServer');
const NULL_EMITTER = {
    emit: function(){}
};

function SSHServer(options) {
    this.server = this._createServer(options.hostKey);
    this.eventSender = options.eventSender || NULL_EMITTER;
}

SSHServer.prototype = {
    listen: function listen() {
        LOGGER.info('Listening on :%d', arguments[0]);
        return this.server.listen.apply(this.server, arguments);
    },

    _createServer: function createServer(hostKey) {
        return new ssh2.Server({
            hostKeys: [
                hostKey
            ]
        }, this._handleClient.bind(this));
    },

    _handleClient: function _handleClient(client, info) {
        const ip = info.ip;
        const ident = info.identRaw;
        LOGGER.info('Accepted SSH connection from %s (%s)', ip, ident);
        this.eventSender.sendNewConnectionEvent({
            time: new Date(),
            ip: ip,
            source: 'ssh',
            payload: {
                ident: ident
            }
        });

        client.on('authentication', context => {
            const event = {
                time: new Date(),
                ip: ip,
                source: 'ssh',
                payload: {
                    method: context.method,
                    username: context.username,
                    ident: ident
                }
            };

            if (context.method === 'password') {
                event.payload.password = context.password;
            } else if (context.method === 'publickey') {
                event.payload.key = {
                    algorithm: context.key.algo,
                    data: context.key.data.toString('base64')
                };
            } else if (context.method === 'keyboard-interactive') {
                event.payload.submethods = context.submethods;
            }

            this.eventSender.sendLoginAttemptEvent(event);
            context.reject();
        });
    }
};

module.exports = SSHServer;
