'use strict';

var request = require('request')
  , util = require('util')
  , events = require('events')
  , url = require('url')
  , discover = require('./discover')
  , LightState = require('./lightstate')
  ;

module.exports = Bridge;
util.inherits(Bridge, events.EventEmitter);

function Bridge(user, bridgeHost) {
    var bridge = this;
    events.EventEmitter.call(this);

    this.user       = user;
    this.data  = {};
    this.bulbs = {};

    if (! bridgeHost) {
        console.log('discovering');
        discover(function (err, address) {
            if (err) {
                throw new Error(err);
            }
            bridge.bridgeHost = address;
            bridge.init();
        });
    } else {
        this.bridgeHost = bridgeHost;
        this.init();
    }
}

Bridge.prototype.init = function () {
    var bridge = this;
    this.getAll(function (err, res) {
        if (err) {
            throw new Error(err);
        }
        bridge.data = res;
        bridge.bulbs = bridge.registerLightStates(res.lights);
        bridge.emit('ready', bridge);
    });
};

Bridge.prototype.registerLightStates = function (lightData) {
    var bridge = this,
        registry = {};
    Object.keys(lightData).forEach(function (l) {
        registry[l] = new LightState(bridge, l, lightData[l].state);
    });
    return registry;
};

Bridge.prototype.getAll = function (cb) {
    this.get('', function (err, resp, body) {
        if (err) {
            return cb(err);
        }
        cb(null, body);
    });
};

Bridge.prototype.getUrl = function (path) {
    return url.format({
        protocol : 'http',
        host     : this.bridgeHost,
        pathname : '/api/' + this.user + '/' + path
    });
};

Bridge.prototype.get = function (path, cb) {
    request.get({
        url: this.getUrl(path),
        json: true
    }, cb);
};

Bridge.prototype.put = function (path, body, cb) {
    request.put({
        url: this.getUrl(path),
        body: body,
        json: true
    }, cb);
};

Bridge.prototype.getBulb = function (nr) {
    return this.bulbs[nr];
};
