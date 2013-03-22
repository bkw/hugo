#!/usr/bin/env node
'use strict';

var Bridge = require('../index').Bridge;

new Bridge('newdeveloper').on('ready', function (bridge) {
    bridge.put('groups/0/action', { alert: 'lselect' }, function (e, r, b) {
        console.log(e, b);
    });
});
