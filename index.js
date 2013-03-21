#!/usr/bin/env node
'use strict';

var join = require('path').join
  , Bridge = require(join(__dirname, 'lib', 'bridge'))
  , async = require('async')
  ;


function wait(howLong, cb) {
    setTimeout(cb, howLong);
}

new Bridge('10.11.100.13', 'newdeveloper').on('ready', function (bridge) {
    var tasks = [],
        bulb = bridge.getBulb(3);
    console.log(bulb);
    process.argv.slice(2).forEach(function (col) {
        tasks.push(async.apply(bulb.setColor.bind(bulb), col, 5));
        tasks.push(async.apply(wait, 500));
    });

    async.series(
        tasks,
        function (err, res) {
            if (err) {
                throw new Error(err);
            }
        }
    );
});

