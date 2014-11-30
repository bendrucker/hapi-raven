'use strict';

var raven  = require('raven');

exports.register = function (server, options, next) {
  var client = new raven.Client(options.dsn, options.client);
  server.expose('client', client);
  server.on('request-error', function (request, err) {
    client.captureError(err);
  });
  next();
};

exports.register.attributes = {
  pkg: require('../package.json')
};
