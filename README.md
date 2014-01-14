node-glint
==========

Setup temporary (for test) TCP server with random port number like Test::TCP (Perl) or Glint (Ruby).

## SYNOPSYS

```
var glint = require('glint').glint;
var net = require('net');

glint(
	function (port) {
		// Execute this function as external process.
		// This function is passed to external process as string,
		// so any parent scope variables are not accessable.
		// `exec` and `execFile` of node.js is NOT unix's `exec`, so this library creates a process for managing external process.
		console.log('starting memcached with port: ' + port);
		require('child_process').execFile('memcached', ['-p', port]);
	},

	function (server, error) {
		if (error) throw error;

		// server is launched and listens port surely.
		// server.port: port of this server
		// server.kill(): kill this server

		console.log(server);
		var s = net.connect(server.port, function () {
			s.write("version\r\n");
		});
		s.on('data', function (data) {
			console.log(data.toString('UTF-8'));
			s.end();
		});

		// The server is alive until process.on('exit') or server.kill() explicitly.
	}
);
```

## Name

"glint" is from Ruby's Glint library.

## Ref.

- https://npmjs.org/package/test-tcp
