'use strict';
var dgram = require('dgram');

function discover(callback) {
    var ssdp_ip = '239.255.255.250',
        ssdp_port = 1900,
        sock = dgram.createSocket('udp4');

    sock.on('error', function onError(err) {
        callback(err);
    });

    sock.on('message', function onMessage(msg, rinfo) {
        callback(null, rinfo.address);
        sock.close();
    });

    sock.on('listening', function onListening() {
        var data = [
                'M-SEARCH * HTTP/1.1',
                'HOST: ' + ssdp_ip + ':' + ssdp_port,
                'ST: "(null)"',
                'MAN: "ssdp:discover"',
                'MX: 3'
            ],
            pkt;

        sock.addMembership(ssdp_ip);
        sock.setMulticastTTL(2);
        pkt = new Buffer(data.join("\r\n"));
        sock.send(pkt, 0, pkt.length, ssdp_port, ssdp_ip);
    });

    sock.bind();
}

module.exports = discover;
