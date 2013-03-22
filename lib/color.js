'use strict';

var color = require('color'),
    _     = require('lodash');

module.exports = {

    ToState : function (colspec) {
        var hsv = color(colspec).hsvArray();
        return {
            hue : Math.round(hsv[0] * (65535 / 360)),
            sat : Math.round(hsv[1] * 2.54),
            bri : Math.round(hsv[2] * 2.54)
        };
    },

    fromState : function (state) {
        var copyKeys = ['on', 'bri'];

        if ('hs' === state.colormode) {
            copyKeys.push('hue', 'sat');
        } else {
            copyKeys.push(state.colormode);
        }
        return _.pick(state, copyKeys);
    }

};
