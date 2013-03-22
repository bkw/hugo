#!/usr/bin/env node
'use strict';

var Bridge = require('../index').Bridge;

new Bridge('newdeveloper').on('ready', function (bridge) {
    bridge.setAllActive({ct: 500, bri: 254});
});

