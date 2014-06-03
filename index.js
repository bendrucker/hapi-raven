'use strict';

var raven     = require('raven');

exports.register = function (plugin, options, next) {
  var dsn;
  if (typeof options === 'string') {
    dsn = options;
    options = null;
  } else {
    dsn = options.dsn;
  }
  var client = new raven.Client(dsn, options);

  plugin.expose('client', client);

  plugin.events.on('internalError', function (request, err) {
    client.captureError(err, {
      request: request
    });
  });

  next();
};
