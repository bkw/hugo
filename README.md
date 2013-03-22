node-bulb
=========

Yet another node.js module for philips hue.


Example
-------

    var bridge = require('bulb').Bridge('someuser', '192.168.x.x');

    bridge.on('ready', function () {
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

Debugging
---------
To see what is going on behind the scenes, you can enable debugging by
setting the environment variable `DEBUG` to any of the following:

* hugo.bridge
* hugo.lightstate
* hugo.color
* hugo.discovery

Multiple values can be separated by commas. Alternatively you can also specify `hugo.*` or even `*

Example:

    % DEBUG=hugo.color node demos/series.js red blue white
    % DEBUG=hugo.lightstate,hugo.bridge node demos/flash.js
    % DEBUG='hugo.*' node demos/fadeout.js 3

