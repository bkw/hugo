#!/usr/bin/env node
'use strict';

var Bridge = require('./index').Bridge
  , async = require('async')
  ;


function wait(howLong, cb) {
    setTimeout(cb, howLong);
}

new Bridge('newdeveloper').on('ready', function (bridge) {
    var tasks = [],
        kitchen = bridge.getBulb(3),
        sofa = bridge.getBulb(1);
    process.argv.slice(2).forEach(function (col) {
        tasks.push(
            function (cb) {
                async.parallel([
                    async.apply(kitchen.flash.bind(kitchen), col),
                    async.apply(sofa.flash.bind(sofa), col)
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

