#!/usr/bin/env node
'use strict';

var join = require('path').join
  , Bulb = require(join(__dirname, 'lib', 'bulb'))
  , async = require('async')
  ;


function wait(howLong, cb) {
    setTimeout(cb, howLong);
}

new Bulb('10.11.100.13', 'newdeveloper').on('ready', function (bulb) {
    var tasks = [];
    process.argv.slice(2).forEach(function (col) {
        tasks.push(async.apply(bulb.setColor.bind(bulb), 3, col, 5));
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

