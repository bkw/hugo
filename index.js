'use strict';

var join = require('path').join
  , Bulb = require(join(__dirname, 'lib', 'bulb'))
  , bulb = new Bulb('10.11.100.13', 'newdeveloper')
  ;

bulb.on('ready', function (lights) {
    console.dir(lights);
});

