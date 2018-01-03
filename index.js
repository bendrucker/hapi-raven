'use strict'

var Raven = require('raven')

var register = function (server, options) {
  Raven.config(options.dsn, options.client)
  server.expose('client', Raven)
  server.events.on({ name: 'request', channels: 'error' }, function (request, event, tags) {
    var baseUrl = request.info.uri ||
      request.info.host && `${server.info.protocol}://${request.info.host}` ||
      /* istanbul ignore next */
      server.info.uri

    Raven.captureException(event.error, {
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
}

exports.plugin = {
  pkg: require('./package.json'),
  register,
}
