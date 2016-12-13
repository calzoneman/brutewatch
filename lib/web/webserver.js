const http = require('http');
const expressWs = require('express-ws-routes');

const LOGGER = require('@calzoneman/jsli').LoggerFactory.getLogger('Webserver');

function Webserver(options) {
    this.wsController = options.wsController;
    this.app = this._createApp();
    this._setupRoutes();
}

Webserver.prototype = {
    listen: function listen() {
        LOGGER.info('Listening on :%d', arguments[0]);
        return this.httpServer = this.app.listen.apply(this.app, arguments);
    },

    _createApp: function _createApp() {
        return expressWs();
    },

    _setupRoutes: function _setupRoutes() {
        this.app.websocket('/ws', (info, accept, next) => {
            accept(socket => {
                socket.remoteAddress = info.req.ip;
                this.wsController.acceptClient(socket);
            });
        });

        this.app.get('/', (req, res) => {
            res.sendFile('index.html', {
                        root: require('path').resolve(__dirname, '..', '..', 'public')});
        });
    }
};

module.exports = Webserver;
