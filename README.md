node-bulb
=========

Yet another node.js module for philips hue.


Example
-------

    var Bridge = require('bulb').Bridge;

    new Bridge('someuser', '192.168.x.y').on('ready', function (bridge) {
        var bulb = bridge.getBulb(1);
        bulb.setColor('red', 5, function (err, res) {
            if (err) {
                throw new Error(err);
            }
            console.log(res);
        });
    });

If you leave out the user name, a username will read from environment variable
`HUE_USER`.

If you leave out the ip address, the address will be read from the environment
variable `HUE_HOST`. If no such variable exists, the bridge will be discovered
over upnp.
This is very hackish and experimental and obviously slower than specifying it.
