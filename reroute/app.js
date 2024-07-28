var fs = require('fs');
var http = require('http');
var https = require('https');
var express = require('express');
var httpProxy = require('http-proxy');


var proxy = httpProxy.createProxyServer({});
proxy.on('error', function(err, req, res) {
    res.writeHead(500, {
        'Content-Type': 'text/plain'
    });
    res.end('Proxy error.');
});

var options = {
    key: fs.readFileSync('selfsigned.key'),
    cert: fs.readFileSync('selfsigned.crt')
};
https.createServer(options, function(req, res) {

    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    res.setHeader('Access-Control-Allow-Credentials', true);


	console.log("CREATING SERVER")
    proxy.web(req, res, { target: 'http://client:3000' });
}).listen(8443);
