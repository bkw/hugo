/*jshint expr:true */
'use strict';

var color = require('color')
  , async = require('async')
  , _     = require('lodash')
  ;

module.exports = LightState;


function LightState(bridge, nr, state) {
    this.bridge = bridge;
    this.nr = nr;
    this.setState(state);
}

LightState.read = function (bridge, light, cb) {
    var instance = new LightState(bridge, light, {});
    instance.reload(cb);
};

LightState.prototype.reload = function (cb) {
    var lightstate = this;
    this.bridge.get('lights/' + this.nr, function (err, resp, body) {
        if (err) {
            cb && cb(err);
            return;
        }
        lightstate.setState(body.state);
        cb && cb(null, body.state);
    });
};

LightState.prototype.setState = function (state, val) {
    if ('object' === typeof(state)) {
        this.state = state;
        return;
    }
    this.state[state] = val;
};

LightState.prototype.mergeValues = function (newValues) {
    var state = _.clone(newValues),
        lightstate = this;
    delete state.transitiontime;
    if (state.xy && this.state.colormode !== 'xy') {
        state.colormode = 'xy';
    }
    if (state.hasOwnProperty('ct') && this.colormode !== 'ct') {
        state.colormode = 'ct';
    }
    if (
        (this.colormode !== 'hs') &&
        (
            state.hasOwnProperty('hue') || state.hasOwnProperty('sat')
        )
    ) {
        // firmware bug! Actually, setting sat without hue while coming
        // from colormode ct sets hs mode, but does not set the bulb to the
        // old hue.
        state.colormode = 'hs';
    }

    Object.keys(state).forEach(function (k) {
        lightstate.setState(k, state[k]);
    });
};


LightState.prototype.set = function (keyVal, cb) {
    var newValues = this.getChanges(keyVal);

    if (! newValues) {
        console.log(this.nr, 'ignoring redundant values:', keyVal);
        if (cb) {
            cb(null, this.state);
        }
        return;
    }
    this.bridge.put(
        'lights/' + this.nr + '/state',
        newValues,
        this.getResponseParser(cb)
    );
};

LightState.prototype.getChanges = function (newValues) {
    var keyVal = _.clone(newValues)
      , transitiontime = keyVal.transitiontime
      , colorParams = ['xy', 'ct', 'hue', 'sat']
      , otherParams = _.omit(keyVal, colorParams)
      , lightstate = this
      ;

    // transitiontime isn't recorded in state:
    delete keyVal.transitiontime;
    // xy > ct > hs
    if (keyVal.xy) {
        delete keyVal.hue;
        delete keyVal.sat;
        delete keyVal.ct;
        if (
            (this.state.colormode === 'xy') &&
            (this.state.xy[0] === keyVal.xy[0]) &&
            (this.state.xy[1] === keyVal.xy[1])
        ) {
            delete keyVal.xy;
        }
    }
    if (keyVal.hasOwnProperty('ct')) {
        delete keyVal.hue;
        delete keyVal.sat;
        if (
            (this.state.colormode === 'ct') &&
            (this.state.ct === keyVal.ct)
        ) {
            delete keyVal.ct;
        }
    }

    if (keyVal.hasOwnProperty('hue') || keyVal.hasOwnProperty('sat')) {
        // bug in firmware:
        // when comimg from ct to hs mode, hue HAS to be present.
        // Otherwise the firware will switch to hs mode without
        // actually updating the color in the bulb.

        if (this.state.colormode === 'ct') {
            if (
                keyVal.hasOwnProperty('sat') &&
                ! keyVal.hasOwnProperty('hue')
            ) {
                keyVal.hue = this.state.hue;
            }
        } else {
            // removing renundant hue coming from other modes seems safe:
            if (this.state.hue === keyVal.hue) {
                delete keyVal.hue;
            }
        }

        // removing redundant sat seems safe:
        if (this.state.sat === keyVal.sat) {
            delete keyVal.sat;
        }
    }


    Object.keys(otherParams).forEach(function (k) {
        if (lightstate.state[k] === keyVal[k]) {
            delete keyVal[k];
        }
    });
    if (Object.keys(keyVal).length === 0) {
        return null;
    }
    // add any transition back in:
    if ('undefined' !== typeof(transitiontime)) {
        keyVal.transitiontime = transitiontime;
    }
    return keyVal;
};

LightState.prototype.getResponseParser = function (cb) {
    var lightstate = this;
    return function (err, resp, body) {
        var newValues = {};
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
                newValues[matches[2]] = row.success[r];
            });
        });
        lightstate.mergeValues(newValues);
        cb && cb(null, lightstate.state);
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
        return {
            xy : this.state.xy,
            bri: this.state.bri
        };
    }
    return {
        ct : this.state.ct,
        bri: this.state.bri
    };
};
