'use strict'

const test = require('tape')
const hapi = require('hapi')
const boom = require('boom')
const proxyquire = require('proxyquire')

test('options', async function (t) {
  t.plan(2)

  const server = Server()
  const plugin = proxyquire('./', {
    raven: {
      config (dsn, options) {
        t.equal(dsn, 'dsn')
        t.deepEqual(options, { foo: 'bar' })
      }
    }
  })

  await register(server, plugin, {
    dsn: 'dsn',
    client: { foo: 'bar' }
  })
})

test('request-error', async function (t) {
  t.plan(11)

  const server = Server()
  const plugin = proxyquire('./', {
    raven: {
      config () {
      },
      captureException (err, data) {
        t.equal(err.message, 'unexpected')
        t.equal(err.output.statusCode, 500)
        t.ok(data.extra)
        t.equal(typeof data.extra.timestamp, 'number')
        t.equal(data.request.method, 'get')
        t.ok(/^http:\/\/.+:0\/$/.test(data.request.url))
        t.deepEqual(data.request.query_string, {})
        t.ok(data.request.headers['user-agent'])
        t.deepEqual(data.request.cookies, {})
        t.equal(data.extra.remoteAddress, '127.0.0.1')
      }
    }
  })

  await register(server, plugin, {})

  const response = await server.inject('/')
  t.equal(response.statusCode, 500)
})

test('boom error', async function (t) {
  t.plan(1)

  const server = Server()
  const plugin = proxyquire('./', {
    raven: {
      config () {
      },
      captureException: t.fail
    }
  })

  await register(server, plugin, {})

  const response = await server.inject('/boom')
  t.equal(response.statusCode, 403)
})

test('tags', async function (t) {
  t.plan(3)

  const server = Server()
  const plugin = proxyquire('./', {
    raven: {
      config () {
      },
      captureException (err, data) {
        t.ok(err)
        t.deepEqual(data.tags, ['beep'])
      }
    }
  })

  await register(server, plugin, { tags: ['beep'] })

  const response = await server.inject('/')
  t.equal(response.statusCode, 500)
})

function Server () {
  const server = hapi.server()

  server.route({
    method: 'GET',
    path: '/',
    handler () {
      throw new Error('unexpected')
    }
  })

  server.route({
    method: 'GET',
    path: '/boom',
    handler () {
      throw boom.forbidden()
    }
  })

  server.initialize()
  return server
}

function register (server, plugin, options) {
  return server.register({
    plugin,
    options
  })
}
