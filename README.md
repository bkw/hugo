node-bulb
=========

Yet another node.js module for philips hue.


Example
-------

    var Bridge = require('bulb').Bridge;

    new Bridge('someuser', '192.168.x.y')
    .on('ready', function (bridge) {
        var bulb = bridge.getBulb(1);
        bulb.setColor('red', 5, function (err, res) {
            if (err) {
                throw new Error(err);
            }
            console.log(res);
        });
    });

If you leave out the ip address, the bridge will be discovered over upnp.
This is obviously slower than specifying it.
