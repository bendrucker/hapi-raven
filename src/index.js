'use strict';

var raven  = require('raven');

exports.register = function (plugin, options, next) {
  var client = new raven.Client(options.dsn, options.client);
  plugin.expose('client', client);
  plugin.events.on('internalError', function (request, err) {
    client.captureError(err, {
      extra: {
        timestamp: request.info.received,
        id: request.id,
        method: request.method,
        path: request.path,
        query: request.query,
        source: {
          remoteAddress: request.info.remoteAddress,
          userAgent: request.raw.req.headers['user-agent']
        }
      }
    });
  });

  next();
};

exports.register.attributes = {
  pkg: require('../package.json')
};
