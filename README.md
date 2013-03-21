node-bulb
=========

Yet another node.js module for philips hue.


Example
-------

    var Bridge = require('bulb').Bridge;

    new Bridge('192.168.x.y', 'someuser')
    .on('ready', function (bridge) {
        var bulb = bridge.getBulb(1);
        bulb.setColor('red', 5);
    });

