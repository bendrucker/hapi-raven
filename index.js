'use strict'

const raven = require('raven')

exports.register = function (server, options) {
  raven.config(options.dsn, options.client)
  server.expose('client', raven)
  server.events.on({name: 'request', channels: 'error'}, function (request, event) {
    const baseUrl = request.info.uri ||
      (request.info.host && `${server.info.protocol}://${request.info.host}`) ||
      /* istanbul ignore next */
      server.info.uri

    raven.captureException(event.error, {
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

exports.name = require('./package.json').name
