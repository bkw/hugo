'use strict';

var color = require('color'),
    _     = require('lodash');

function removeUnusedParams(requestedState, oldState) {
    // order is important. xy > ct > hs.
    var newState = _.clone(requestedState),
        modeOverrides = [
            { mode: 'xy', params: ['xy'], obsolete : ['hue', 'sat', 'ct']},
            { mode: 'ct', params: ['ct'], obsolete : ['hue', 'sat']}
            // hs mode has firmware bugs, see below
            // { mode: 'hs', params: ['hue', 'sat'], obsolete : []}
        ],
        otherParams = _.omit(newState, ['xy', 'ct', 'hue', 'sat']);

    modeOverrides.forEach(function (m) {
        if (_.intersection(Object.keys(newState), m.params).length) {
            m.obsolete.forEach(function (param) {
                delete newState[param];
            });
            if (oldState.colormode === m.mode) {
                m.params.forEach(function (p) {
                    if (_.isEqual(oldState[p], newState[p])) {
                        delete newState[p];
                    }
                });
            }
        }
    });

    // kludge for firmware bug:
    // when comimg from ct to hs mode, hue HAS to be present.
    // Otherwise the firware will switch to hs mode without
    // actually updating the color in the bulb.
    if (newState.hasOwnProperty('hue') || newState.hasOwnProperty('sat')) {

        // bug only seems to hit when prior state was ct:
        if (oldState.colormode === 'ct') {
            if (
                newState.hasOwnProperty('sat') &&
                ! newState.hasOwnProperty('hue')
            ) {
                // enforce hue is present in new request
                newState.hue = oldState.hue;
            }
        } else {
            // removing renundant hue coming from other modes seems safe:
            if (oldState.hue === newState.hue) {
                delete newState.hue;
            }
        }

        // removing redundant sat seems safe:
        if (oldState.sat === newState.sat) {
            delete newState.sat;
        }
    }
    // end of kludge for firmware bug:

    Object.keys(otherParams).forEach(function (k) {
        if (_.isEqual(oldState[k], newState[k])) {
            delete newState[k];
        }
    });

    return newState;
}

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
    },

    removeUnusedParams : removeUnusedParams
};
