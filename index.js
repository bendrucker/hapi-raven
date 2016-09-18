'use strict'

var raven = require('raven')

exports.register = function (server, options, next) {
  var client = new raven.Client(options.dsn, options.client)
  server.expose('client', client)
  server.on('request-error', function (request, err) {
    client.captureException(err, {
      request: {
        method: request.method,
        url: request.info.uri + request.path,
        query_string: request.query,
        headers: request.headers,
        cookies: request.state,
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
