#!/usr/bin/env node
'use strict';

var bridge = require('../index').Bridge();

bridge.on('ready', function () {
    bridge.setAllActive({ct: 500, bri: 254});
});

