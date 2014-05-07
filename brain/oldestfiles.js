var fs = require('fs');
// var dir = '../radio'; // your directory

/*var files = fs.readdirSync(dir);
files.sort(function(a, b) {
   return fs.statSync(dir + a).mtime.getTime() - 
          fs.statSync(dir + b).mtime.getTime();
});*/

var fs = require('fs');
var walk = function(dir, done) {
  var results = [];
  fs.readdir(dir, function(err, list) {
    if (err) return done(err);
    var pending = list.length;
    if (!pending) return done(null, results);
    list.forEach(function(file) {
      file = dir + '/' + file;
      fs.stat(file, function(err, stat) {
        if (stat && stat.isDirectory()) {
          walk(file, function(err, res) {
            results = results.concat(res);
            if (!--pending) done(null, results);
          });
        } else {
          results.push(file);
          if (!--pending) done(null, results);
        }
      });
    });
  });
};


exports.oldestfiles = function (dir, callback) {

	walk(dir, function (err, results) {
		
		if(err)
		{
			callback(err);
		}
		// console.log(results);
		var files = results;
		files.sort(function(a, b) {
		   return fs.statSync(a).mtime.getTime() - 
		          fs.statSync(b).mtime.getTime();
		});

		// console.log(files);
		callback(null, files)
	});
}

// console.log(files);