#!/usr/bin/env node
'use strict';

var bridge = require('../index').Bridge();

bridge.on('ready', function () {
    bridge.setAllActive({ct: 153, bri: 254});
});

