#!/usr/bin/env node
'use strict';

var join = require('path').join
  , Bridge = require(join(__dirname, 'lib', 'bridge'))
  ;


new Bridge('10.11.100.17', 'newdeveloper').on('ready', function (bridge) {
    var kitchen = bridge.getBulb(3),
        sofa = bridge.getBulb(1);
    sofa.set({ct: 153});
    kitchen.set({ct: 152});
});

