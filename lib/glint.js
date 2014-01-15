#!node

var net = require('net');
var path = require('path');

function glint (func, callback) {
	empty_port(function (e, port) {
		if (e) return callback(e, null);

		var server = {};
		server.port = port;
		server.process = require('child_process').spawn(process.execPath, [path.join(__dirname, 'child.js'), server.port, func.toString()], {
			stdio: 'inherit',
			detached: true
		});
		// detached: true かつ unref() しとくと、このプロセスの終了を待たずに node プロセスが終了し、process.on('exit') が走る
		server.process.unref();
		server.kill = function () {
			server.process.kill();
		};

		process.on('exit', function () {
			server.kill();
		});

		// SIGINT で終了されると exit が呼ばれないので登録する。
		// シェルから Ctrl-C とかしたとき用
		var exit = function () {
			// 後続の SIGINT ハンドラを一応実行する
			setTimeout(process.exit, 1000);
		};
		process.on('SIGINT', exit);
		process.on('SIGTERM', exit);

		wait_port(port, 3000, function (e) {
			callback(e, server);
		});
	});
}

// From Test::TCP
function empty_port (callback) {
	var port = 50000 + Math.floor(Math.random() * 1000);

	function _empty_port () {
		var server = net.createServer().
			on('error', function (e) {
				if (e.errno === 'EADDRINUSE') {
					if (port < 60000) {
						port++;
						_empty_port();
					} else {
						callback('no empty port found', null);
					}
				} else {
					callback(e, null);
				}
			}).
			on('close', function () {
				callback(null, port);
			}).
			listen(port, function () {
				this.close();
			});
	}

	_empty_port();
}

function wait_port(port, max, callback) {
	var timeout = false;
	var timer = setTimeout(function () {
		timeout = true;
	}, max);

	function _wait_port () {
		var s = new net.Socket();
		s.on('error', function (e) {
			if (e.errno === 'ECONNREFUSED') {
				if (!timeout) {
					setTimeout(_wait_port, 100);
				} else {
					callback('timeout');
				}
			}
		});
		s.connect(port, function () {
			clearTimeout(timer);
			callback();
			s.destroy();
		});
	}

	_wait_port();
}


this.wait_port = wait_port;
this.empty_port = empty_port;
this.glint = glint;

