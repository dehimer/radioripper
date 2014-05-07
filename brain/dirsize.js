var fs = require('fs');
var path = require('path');
var async = require('async');



var readSizeRecursive = function (item, cb) {
  fs.lstat(item, function(err, stats) {
    var total = stats.size;

    if (!err && stats.isDirectory()) {
      fs.readdir(item, function(err, list) {
        async.forEach(
          list,
          function(diritem, callback) {
            readSizeRecursive(path.join(item, diritem), function(err, size) {
              total += size;
              callback(err);
            }); 
          },  
          function(err) {
            cb(err, total);
          }   
        );  
      }); 
    }   
    else {
      cb(err, total);
    }   
  }); 
}

exports.getsize = readSizeRecursive;