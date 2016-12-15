'use strict'

var Raven = require('raven')

exports.register = function (server, options, next) {
  Raven.config(options.dsn, options.client)
  server.expose('client', Raven)
  server.on('request-error', function (request, err) {
    var baseUrl = request.info.uri ||
      request.info.host && `${server.info.protocol}://${request.info.host}` ||
      /* istanbul ignore next */
      server.info.uri

    Raven.captureException(err, {
      request: {
        method: request.method,
        query_string: request.query,
        headers: request.headers,
        cookies: request.state,
        url: baseUrl + request.path
      },
      extra: {
        timestamp: request.info.received,
        id: request.id,
        remoteAddress: request.info.remoteAddress
      },
      tags: options.tags
    })
  })

  next()
}

exports.register.attributes = {
  pkg: require('./package.json')
}
