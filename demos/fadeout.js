#!/usr/bin/env node
'use strict';

var Bridge = require('../index').Bridge;
var timeout = process.argv[2] || 10;

new Bridge().on('ready', function (bridge) {
    bridge.getBulbsActive().forEach(function (bulb) {
        bulb.set({bri: 0, transitiontime: timeout * 10});
        setTimeout(function () {
            bulb.set({on: false});
        }, timeout * 1000);
    });
});
