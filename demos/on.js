#!/usr/bin/env node
'use strict';

var Bridge = require('../index').Bridge;

new Bridge().on('ready', function (bridge) {
    bridge.setAll({on: true});
});

