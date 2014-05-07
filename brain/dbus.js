var dbus = require('dbus-native');

var bus = dbus.systemBus();
udservice = bus.getService('org.freedesktop.UDisks');
udservice.getInterface(
    '/org/freedesktop/UDisks',
    'org.freedesktop.UDisks', 
    function(err, ud) {
        ud.on('DeviceAdded', function(deviceObjectPath) {
            console.log('DeviceAdded', deviceObjectPath);

             udservice.getInterface(deviceObjectPath, 'org.freedesktop.DBus.Properties', function(err, diskProperties) {
                diskProperties.Get('/org/freedesktop/UDisks/Device', 'DeviceMountPaths', function(err, mountPointPaths) {
                    // console.log(JSON.stringify(mountPointPaths.length))
                    console.log(mountPointPaths[1])
                });
            });

        });
        ud.on('DeviceRemoved', function(deviceObjectPath) {
            console.log('DeviceRemoved', deviceObjectPath);
        });
    }
);