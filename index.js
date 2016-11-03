'use strict'

var raven = require('raven')

exports.register = function (server, options, next) {
  var client = new raven.Client(options.dsn, options.client)
  server.expose('client', client)
  server.on('request-error', function (request, err) {

    var baseUrl = request.info.uri;
    baseUrl = baseUrl || request.info.host && `${server.info.protocol}://${request.info.host}` || server.info.uri;

    client.captureException(err, {
      request: {
        method: request.method,
        query_string: request.query,
        headers: request.headers,
        cookies: request.state,
        url: baseUrl + request.path,
      },
      extra: {
        timestamp: request.info.received,
        id: request.id,
        remoteAddress: request.info.remoteAddress,
      },
      tags: options.tags
    })
  })

  next()
}

exports.register.attributes = {
  pkg: require('./package.json')
}
