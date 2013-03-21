'use strict';

var color = require('color')
  , async = require('async')
  ;

module.exports = LightState;


function LightState(bridge, nr, state) {
    this.bridge = bridge;
    this.nr = nr;
    this.state = state;
}

LightState.read = function (bridge, light, cb) {
    bridge.get('lights/' + light, function (err, resp, body) {
        if (err) {
            return cb(err);
        }
        cb(null, new LightState(bridge, light, body.state));
    });
};

LightState.prototype.set = function (keyVal, cb) {
    this.bridge.put(
        'lights/' + this.nr + '/state',
        keyVal,
        this.getResponseParser(cb)
    );
};

LightState.prototype.getResponseParser = function (cb) {
    var lightstate = this;
    return function (err, resp, body) {
        if (err) {
            if (cb) {
                return cb(err);
            }
            throw new Error(err);
        }
        if (200 !== resp.statusCode) {
            return cb(body);
        }
        body.forEach(function (row) {
            var errMsg;
            if (row.error) {
                errMsg = row.error.address + ': ' + row.error.description;
                if (cb) {
                    return cb(errMsg);
                }
                throw new Error(errMsg);
            }
            Object.keys(row.success).forEach(function (r) {
                var matches;
                matches = r.match(/\/lights\/(\d+)\/state\/(\S+)/);
                if (matches) {
                    lightstate.state[matches[2]] = row.success[r];
                }
            });
        });
        if (cb) {
            cb(null, lightstate.state);
        }
    };
};


LightState.prototype.setColor = function (col, transition, cb) {
    var hsv = color(col).hsvArray();
    this.set({
        transitiontime : transition || 1,
        hue : Math.round(hsv[0] * (65535 / 360)),
        sat : Math.round(hsv[1] * 2.54),
        bri : Math.round(hsv[2] * 2.54),
        on : true
    }, cb);
};

LightState.prototype.flash = function (col, cb) {
    var oldVals = this.getColorValues();

    if (! this.state.on) {
        return cb(null);
    }

    oldVals.transitiontime = 1;

    async.series([
        async.apply(this.setColor.bind(this), col, 0),
        async.apply(this.set.bind(this), oldVals)
    ], cb);
};

LightState.prototype.getColorValues = function () {
    if ('hs' === this.state.colormode) {
        return {
            hue : this.state.hue,
            sat : this.state.sat,
            bri : this.state.bri
        };
    } else if ('xy' === this.state.colormode) {
        return { xy : this.state.xy };
    }
    return { ct : this.state.ct };
};


