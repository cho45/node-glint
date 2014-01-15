#!node

var assert = require('assert');

var glint = require('../lib/glint.js').glint;
var net = require('net');

glint(
	function (port) {
		var net = require('net');
		var server = net.createServer(function (s) {
			s.on('data', function (data) {
				var commands = data.toString('UTF-8').split(/\r\n/);
				for (var i = 0, len = commands.length; i < len; i++) {
					if (commands[i] === 'version') {
						s.write("1.0.0\r\n");
					}
				}
			});
		});
		server.listen(port, function () {
		});
	},

	function (error, server) {
		if (error) throw error;

		var s = net.connect(server.port, function () {
			s.write("version\r\n");
		});
		s.on('data', function (data) {
			var ret = data.toString('UTF-8');
			assert.equal(ret, '1.0.0\r\n');
			s.end();
		});
	}
);


//glint(
//	function (port) {
//		// ここは外部プロセスで実行される
//		// ただし文字列化して関数が渡されるので外のスコープの変数は使えない。
//		// node.js の exec, execFile はいわゆる exec ではないので1つプロセスが余分にできる。我慢するしかない。
//		console.log('starting memcached with port: ' + port);
//		require('child_process').execFile('memcached', ['-p', port]);
//	},
//
//	function (server, error) {
//		if (error) throw error;
//
//		// server は起動が確認済み
//		// server.port でポート番号がとれる。
//		// server.kill() でこのプロセスだけ殺せる
//
//		console.log(server);
//		var s = net.connect(server.port, function () {
//			s.write("version\r\n");
//		});
//		s.on('data', function (data) {
//			console.log(data.toString('UTF-8'));
//			s.end();
//		});
//
//		// この関数を抜けても exit されるまで server は (明示的にkillしない限り) kill されない
//	}
//);
