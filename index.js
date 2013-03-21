#!/usr/bin/env node
'use strict';

var join = require('path').join
  , Bridge = require(join(__dirname, 'lib', 'bridge'))
  , async = require('async')
  ;


function wait(howLong, cb) {
    setTimeout(cb, howLong);
}

new Bridge('10.11.100.17', 'newdeveloper').on('ready', function (bridge) {
    var tasks = [],
        kitchen = bridge.getBulb(3),
        sofa = bridge.getBulb(1);
    process.argv.slice(2).forEach(function (col) {
        tasks.push(
            function (cb) {
                async.parallel([
                    async.apply(kitchen.setColor.bind(kitchen), col, 2),
                    async.apply(sofa.setColor.bind(sofa), col, 2)
                ], cb);
            }
        );
        tasks.push(async.apply(wait, 1000));
    });
    tasks.pop();

    async.series(
        tasks,
        function (err, res) {
            if (err) {
                throw new Error(err);
            }
        }
    );
});

