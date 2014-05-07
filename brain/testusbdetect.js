var mkdirp = require('mkdirp');
var rimraf = require('rimraf');
var ncp = require('ncp');
var fs = require('fs');

var _ = require('underscore');

var mounted = {};

console.log('start')

mkdirp('../flash', function (err) {
    

    if (err) console.error(err);

	console.log('flash dir for mount created '+err);

	var sys = require('sys')
	var exec = require('child_process').exec;
	function puts(error, stdout, stderr) { sys.puts(stdout) }

    //изменяем права на папку
    exec('chmod 777 -R ../flash', function(error, stdout, stderr){

    	console.log('chmod done');

    	// console.log(error, stdout, stderr)
		// puts(error, stdout, stderr);

		exec('chown $USER -R ../flash', function(error, stdout, stderr){

			console.log('chown done');

			// console.log(error, stdout, stderr)
			// puts(error, stdout, stderr);

			var udev = require("udev");

			// console.log(udev.list()); // this is a long list :)
			// console.log(udev)

			var mo = false;
			var monitor = udev.monitor();
			monitor.on('add', function (device) {
			    console.log('added: ');

			    // console.log(device);
			    // return;
			    if(device['DEVNAME'] && !mo)
			    {
			    	mo = true;
				    console.log('mount '+device['DEVNAME']+' ../flash')
				    // return;
				    exec('mount '+device['DEVNAME']+' ../flash', function(error, stdout, stderr){
				    	console.log(error, stdout, stderr)
				    	puts(error, stdout, stderr);

				    	mounted[device['DEVNAME']] = true;

					    //проверить, есть ли папка радио
						if(fs.existsSync("../flash/radio")) {
							console.log('existst')
						    
						    rimraf('../flash/radio', function (err) {
						    	if (err) {
							   		return console.error(err);
							 	}
						    
						    	console.log('removed')
						    	
						    	ncp('../radio', '../flash/radio', {filter:/incomplete/},function (err) {
								 	if (err) {
								   		return console.error(err);
								 	}
								 	console.log('done!');
								 	exec('chmod 777 ../flash', function(error, stdout, stderr){
								 		console.log(error, stdout, stderr)
				    					puts(error, stdout, stderr);
								 	});
								});
						    });
						}
				    });
			    }


			    //monitor.close() // this closes the monitor.
			});
			monitor.on('remove', function (device) {
			    console.log('removed: ');
			    console.log(device);

			    if(device['DEVNAME'])
			    {
			    	delete mounted[device['DEVNAME']];
				    console.log('umount '+device['DEVNAME'])
				    exec('umount '+device['DEVNAME'], function(error, stdout, stderr){
				    	console.log(error, stdout, stderr)
				    	puts(error, stdout, stderr);
				    });
				}
			});
			monitor.on('change', function (device) {
			    console.log('changed: ');
			    console.log(device)
			});
			
			//обработка событий выхода
			process.on('exit', function () {
				console.log('exit')
				_.each(mounted, function (val, devname) {
					if(val)
					{
						delete mounted[devname];
						console.log('umount '+devname)
					    exec('umount '+devname, function(error, stdout, stderr){
					    	console.log(error, stdout, stderr)
					    	puts(error, stdout, stderr);
					    });
					}
				})
				monitor.close();
			});
			process.on('SIGINT', function() {
			    process.exit(0)
			});
		});


    });
	
});


// fs.rmdirSync('../flash');
// fs.mkdirSync('../flash');

