'use strict';

var raven  = require('raven');

exports.register = function (plugin, options, next) {
  var client = new raven.Client(options.dsn, options.client);
  plugin.expose('client', client);
  plugin.events.on('internalError', function (request, err) {
    client.captureError(err, {
      request: request
    });
  });

  next();
};

exports.register.attributes = {
  pkg: require('./package.json')
};
