#!/usr/bin/env node
'use strict';

var Bridge = require('./index').Bridge
  , async = require('async')
  ;


function wait(howLong, cb) {
    setTimeout(cb, howLong);
}

new Bridge('10.11.100.17', 'newdeveloper').on('ready', function (bridge) {
    var tasks = [],
        kitchen = bridge.getBulb(3),
        sofa = bridge.getBulb(1),
        oldCol = kitchen.getColorValues();

    oldCol.transitiontime = 0;

    process.argv.slice(2).forEach(function (col) {
        tasks.push(
            async.apply(async.parallel, [
                async.apply(kitchen.setColor.bind(kitchen), col, 0),
                async.apply(sofa.setColor.bind(sofa), col, 0)
            ])
        );
        tasks.push(
            async.apply(async.parallel, [
                async.apply(kitchen.set.bind(kitchen), oldCol),
                async.apply(sofa.set.bind(sofa), oldCol)
            ])
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

