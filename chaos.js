#!/usr/bin/env node
'use strict';

var Bridge = require('./index').Bridge;

new Bridge('newdeveloper').on('ready', function (bridge) {
    Object.keys(bridge.bulbs).filter(function (b) {
        return bridge.bulbs[b].state.on;
    }).map(function (b) {
        cycle(bridge.getBulb(b));
    });
});

function cycle(bulb) {
    bulb.set(
        {
            hue: Math.round(Math.random() * 65535),
            transitiontime: 1
        },
        function (err, res) {
            if (err) {
                console.log('Backing off', err);
                setTimeout(function () {
                    cycle(bulb);
                }, 1000);
                return;
            }
            process.nextTick(function () { cycle(bulb); });
        }
    );
}

