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
        sat : Math.round(hsv[1] * 2.55),
        bri : Math.round(hsv[2] * 2.55),
        on : true
    }, cb);
};

LightState.prototype.flash = function (col, cb) {
    var oldVals = { transitiontime : 1 };
    if (! this.state.on) {
        return cb(null);
    }

    if ('hs' === this.state.colormode) {
        oldVals.hue = this.state.hue;
        oldVals.sat = this.state.sat;
        oldVals.bri = this.state.bri;
    } else if ('xy' === this.state.colormode) {
        oldVals.xy = this.state.xy;
    } else {
        oldVals.ct = this.state.ct;
    }

    async.series([
        async.apply(this.setColor.bind(this), col, 0),
        async.apply(this.set.bind(this), oldVals)
    ], cb);
};

