
var port = process.argv[2];
var func = eval('('+process.argv[3]+')');

func(port);

