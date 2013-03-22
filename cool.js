#!/usr/bin/env node
'use strict';

var Bridge = require('./index').Bridge;

new Bridge('newdeveloper').on('ready', function (bridge) {
    var kitchen = bridge.getBulb(3),
        sofa = bridge.getBulb(1);
    sofa.set({ct: 153});
    kitchen.set({ct: 152});
});

