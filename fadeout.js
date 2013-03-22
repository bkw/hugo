#!/usr/bin/env node
'use strict';

var Bridge = require('./index').Bridge;

new Bridge('newdeveloper').on('ready', function (bridge) {
    Object.keys(bridge.bulbs).filter(function (b) {
        return bridge.bulbs[b].state.on;
    }).map(function (b) {
        var bulb = bridge.getBulb(b),
            timeout = process.argv[2] || 10;
        bulb.set({bri: 0, transitiontime: timeout * 10});
        setTimeout(function () {
            bulb.set({on: false});
        }, timeout * 1000);
    });
});


