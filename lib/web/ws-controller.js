const LOGGER = require('@calzoneman/jsli').LoggerFactory.getLogger('WebsocketController');
const NULL_EMITTER = {
    on: function(){}
};

function WebsocketController(options) {
    this.clients = [];
    this.eventEmitter = options.eventEmitter || NULL_EMITTER;

    this._setupEventListener();
}

WebsocketController.prototype = {
    acceptClient: function acceptSocket(socket) {
        LOGGER.info('Accepted websocket client from %s', socket.remoteAddress);
        this.clients.push(socket);
        socket.on('close', () => {
            LOGGER.info('Websocket %s closed', socket.remoteAddress);
            const index = this.clients.indexOf(socket);
            if (index >= 0) {
                this.clients.splice(index, 1);
            }
        });

        socket.on('error', () => {
            LOGGER.warn('Websocket %s error: %s', socket.remoteAddress, error);
        });
    },

    broadcast: function broadcast(message) {
        LOGGER.info('[Broadcast] %s', message);
        this.clients.forEach(client => {
            try {
                client.send(message);
            } catch (error) {
                LOGGER.warn('Error delivering message to %s: %s', client.remoteAddress,
                        error);
            }
        });
    },

    _setupEventListener: function _setupEventListener() {
        this.eventEmitter.on('new connection', event => {
            this.broadcast(JSON.stringify(event));
        });

        this.eventEmitter.on('login attempt', event => {
            this.broadcast(JSON.stringify(event));
        });
    }
};

module.exports = WebsocketController;
