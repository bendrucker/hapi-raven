'use strict';

var raven  = require('raven');

exports.register = function (server, options, next) {
  var client = new raven.Client(options.dsn, options.client);
  server.expose('client', client);
  server.on('request-error', function (request, err) {
    client.captureError(err, {
      extra: {
        timestamp: request.info.received,
        id: request.id,
        method: request.method,
        path: request.path,
        query: request.query,
        remoteAddress: request.info.remoteAddress,
        userAgent: request.raw.req.headers['user-agent']
      },
      tags: options.tags
    });
  });

  next();
};

exports.register.attributes = {
  pkg: require('../package')
};
