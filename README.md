hapi-raven
==========

A Hapi plugin for sending exceptions to Sentry through Raven. 

## Setup

[require](https://github.com/spumko/hapi/blob/master/docs/Reference.md#packrequirename-options-callback) the plugin on the pack where you wish to use it. As the plugin `options` you can pass:

* **`string`**: Your Sentry DSN
* **`object`**: An object with property `dsn` (required). This object will be passed directly to [raven-node](https://github.com/getsentry/raven-node). It [parses options](https://github.com/getsentry/raven-node/blob/master/lib/client.js#L27-L32) for `name`, `site`, `root`, `transport`, and `logger`.

Note that DSN configuration using `process.env` is not supported. If you wish to replicate the [default environment variable behavior](https://github.com/getsentry/raven-node/blob/master/lib/client.js#L21), you'll need to supply the value directly:

```js
pack.require('hapi-raven', process.env.SENTRY_DSN);
```

## Usage

Once you require the plugin on a pack, logging will happen automatically. 

The plugin listens for [`'internalError'` events](https://github.com/spumko/hapi/blob/master/docs/Reference.md#server-events) on your pack which are "emitted whenever an Internal Server Error (500) error response is sent."

--------------

#### Boom Non-500 Errors are Not Logged

```js
server.route({
  method: 'GET',
  path: '/',
  handler: function (request, reply) {
    reply(Hapi.error.notFound());
  }
});

server.inject('/', function (response) {
  // nothing was logged
});
```

#### 500 Errors are Logged

```js
server.route({
  method: 'GET',
  path: '/throw',
  handler: function (request, reply) {
    throw new Error();
  }
});

server.inject('/throw', function (response) {
  // thrown error is logged to Sentry
});
```

```js
server.route({
  method: 'GET',
  path: '/reply',
  handler: function (request, reply) {
    reply(new Error());
  }
});

server.inject('/throw', function (response) {
  // passed error is logged to Sentry
});
```

-------------------------

For convenience, hapi-raven [exposes](https://github.com/spumko/hapi/blob/master/docs/Reference.md#pluginexposekey-value) the node-raven client on your server as `server.plugins['hapi-raven'].client`. If you want to capture errors other than those raised by `'internalError'`, you can use the client directly inside an [`'onPreResponse'`](https://github.com/spumko/hapi/blob/master/docs/Reference.md#error-transformation) extension point.

### Example: Capture all 404 errors
```js
server.ext('onPreResponse', function (request, reply) {
  if (request.isBoom && request.response.statusCode === 404) {
    server.plugins['hapi-raven'].client.captureError(request.response);
  }
});
```
