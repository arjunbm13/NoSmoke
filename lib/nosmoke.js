'use strict';

const http = require('http');
const root = require('window-or-global');

const _ = require('./common/helper');
const Server = require('./server/server');
const logger = require('./common/logger');

const {
  opn,
  detectPort
} = _;

function *fetchPort(options) {
  let port = yield detectPort(options.port);

  if (port !== parseInt(options.port, 10)) {
    logger.info('port: %d was occupied, changed port: %d', options.port, port);
    options.port = port;
  }
}

function *setupReport(options) {
  if (!options.silent) {
    yield opn(`http://${_.ipv4}:${options.port}`);
  } else {
    http.get({
      host: _.ipv4,
      port: options.port
    });
  }
}

module.exports = function *(options) {
  try {
    yield fetchPort(options);
    const server = new Server(options);
    root.cmdArgs = options;

    yield server.start();
    yield require('./crawler/index');
    yield setupReport(options);
  } catch (e) {
    console.log(e);
  }
};
