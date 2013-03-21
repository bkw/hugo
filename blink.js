#!/usr/bin/env node
'use strict';

var join = require('path').join
  , Bridge = require(join(__dirname, 'lib', 'bridge'))
  ;


new Bridge('10.11.100.17', 'newdeveloper').on('ready', function (bridge) {
    bridge.put('groups/0/action', { alert: 'lselect' }, function (e, r, b) {
        console.log(e,b);
    });
});

