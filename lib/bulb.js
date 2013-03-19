'use strict';

var request = require('request'),
    util    = require('util'),
    events  = require('events'),
    async   = require('async'),
    url     = require('url');

module.exports = Bulb;
util.inherits(Bulb, events.EventEmitter);

function Bulb(bridgeHost, user) {
    var that = this;
    events.EventEmitter.call(this);

    this.bridgeHost = bridgeHost;
    this.user       = user;
    this.lightData  = {};

    this.init(function (err, resp, body) {
        if (err) {
            throw new Error(err);
        }
        that.getLightStates(Object.keys(body), function (err, result) {
            if (err) {
                throw new Error(err);
            }
            that.lightData = result;
            that.emit('ready', result);
        });
    });
}
Bulb.prototype.getLightStates = function (lights, cb) {
    async.map(lights, this.getLightState.bind(this), function (err, res) {
        var i = 0,
            lightData = {};

        if (err) {
            return cb(err);
        }
        for (; i < lights.length; ++i) {
            lightData[lights[i]] = res[i];
        }
        return cb(null, lightData);
    });
};

Bulb.prototype.getLightState = function (light, cb) {
    request.get({
        url : this.getUrl('lights/' + light),
        json: true
    }, function (err, resp, body) { cb(err, body); });
};

Bulb.prototype.init = function (callback) {
    request.get({
        url : this.getUrl('lights'),
        json: true
    }, callback);
};

Bulb.prototype.getUrl = function (path) {
    return url.format({
        protocol : 'http',
        host     : this.bridgeHost,
        pathname : '/api/' + this.user + '/' + path
    });
};

