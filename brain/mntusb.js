var udev = require("udev");

var mo = false;
var monitor = udev.monitor();
monitor.on('add', function (device) {
	console.log('\n');
    console.log(device);
});