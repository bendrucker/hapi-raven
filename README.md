hapi-raven [![Build Status](https://travis-ci.org/bendrucker/hapi-raven.svg?branch=master)](https://travis-ci.org/bendrucker/hapi-raven)
==========

A Hapi plugin for sending exceptions to Sentry through Raven. 

## Setup

Options:

* **`dsn`**: Your Sentry DSN (required)
* **`client`**: An options object that will be passed directly to the client as its second argument (optional)

Note that DSN configuration using `process.env` is not supported. If you wish to replicate the [default environment variable behavior](https://github.com/getsentry/raven-node/blob/master/lib/client.js#L21), you'll need to supply the value directly:

```js
pack.register({
  plugin: require('hapi-raven'),
  options: {
    dsn: process.env.SENTRY_DSN
  }
});
```

## Usage

Once you register the plugin on a pack, logging will happen automatically. 

The plugin listens for [`'internalError'` events](http://hapijs.com/api#server-events) on your pack which are "emitted whenever an Internal Server Error (500) error response is sent."

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

For convenience, hapi-raven [exposes](http://hapijs.com/api#pluginexposekey-value) the `node-raven` client on your server as `server.plugins['hapi-raven'].client`. If you want to capture errors other than those raised by `'internalError'`, you can use the client directly inside an [`'onPreResponse'`](http://hapijs.com/api#error-transformation) extension point.

### Example: Capture all 404 errors
```js
server.ext('onPreResponse', function (request, reply) {
  if (request.isBoom && request.response.statusCode === 404) {
    server.plugins['hapi-raven'].client.captureError(request.response);
  }
});
```
