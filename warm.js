#!/usr/bin/env node
'use strict';

var Bridge = require('./index').Bridge;

new Bridge('newdeveloper').on('ready', function (bridge) {
    var kitchen = bridge.getBulb(3),
        sofa = bridge.getBulb(1);
    sofa.set({ct: 500, bri: 254, transitiontime: 5});
    kitchen.set({ct: 500, bri: 254});
});

