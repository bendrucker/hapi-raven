'use strict';

var chai   = require('chai').use(require('sinon-chai'));
var expect = chai.expect;
var hapi   = require('hapi');
var raven  = require('raven');
var sinon  = require('sinon');
var boom   = require('boom');

/* globals describe:false, beforeEach:false, afterEach:false, it:false */

describe('hapi-raven', function () {

  var server, error;
  beforeEach(function () {
    server = new hapi.Server();
    error  = new Error();
    server.route({
      method: 'GET',
      path: '/',
      handler: function (request, reply) {
        reply(error);
      }
    });
    server.route({
      method: 'GET',
      path: '/boom',
      handler: function (request, reply) {
        reply(boom.forbidden());
      }
    });
  });

  function register (options) {
    server.pack.register({
      plugin: require('../'),
      options: options || {
        dsn: 'dsn'
      }
    }, function (err) {
      if (err) throw err;
    })
  }

  it('registers with the dsn and client options', function () {
    sinon.stub(raven, 'Client');
    var options = {};
    register({
      dsn: 'dsn',
      client: options
    });
    expect(raven.Client).to.have.been.calledWith('dsn', options);
    raven.Client.restore();
  });

  it('captures internal errors', function (done) {
    var capture = sinon.spy();
    sinon.stub(raven, 'Client').returns({
      captureError: capture
    });
    register();
    server.inject('/', function () {
      expect(capture).to.have.been.calledWith(error, sinon.match.has('extra', {
        timestamp: sinon.match.number,
        id: sinon.match.string,
        method: 'get',
        path: '/',
        query: {},
        source: {
          remoteAddress: '',
          userAgent: 'shot'
        }
      }));
      raven.Client.restore();
      done();
    });
  });

  it('does not capture boom errors', function (done) {
    var capture = sinon.spy();
    sinon.stub(raven, 'Client').returns({
      captureError: capture
    });
    register();
    server.inject('/boom', function () {
      expect(capture).to.not.have.been.called;
      raven.Client.restore();
      done();
    });
  });

});
