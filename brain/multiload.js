
var _ = require('underscore');
var fs = require('fs');
var spawn     = require('child_process').spawn;

//слежение за оставшимся количеством места
var diskspace = require('diskspace');
var dirsize = require('./dirsize.js');
var oldestfiles = require('./oldestfiles.js')


var logprocess = true,
    logspace = true;

var childrens  = [];


//остановить все процессы при выходе
{
    var stopripping = function() {
        console.log('killing', childrens.length, 'child processes');
        childrens.forEach(function(child) {
            console.log('station killed');
            child.kill('SIGINT');
        });
    };

    //обработка событий выхода
    process.on('exit', stopripping);
    process.on('SIGINT', function() {
        process.exit(0);
    });
}



//чтение файла настроек
fs.readFile('./settings.json', 'utf8', function (err, data) {
    
    if (err) {
        console.log('Error: ' + err);
        return;
    };

 
    var settings = JSON.parse(data);


    var musicdirpath = settings.musicdirpath || 'radio';
    //создание целевой папки для аудиофайлов, если её нет
    if (!fs.existsSync(musicdirpath)){
        fs.mkdirSync(musicdirpath);
    };

    //что это за странная задержка?
    setInterval(function () {

        dirsize.getsize(musicdirpath, function(err, total){

            var overflowsize = total - settings.musicdirecorysizeMb*1000000-10000000;
            console.log('total: '+total+' allocated: '+settings.musicdirecorysizeMb*1000000+' overflow: '+overflowsize)
            // return;
            //проверить, не вышла ли папка за рамки предоставленного размера 
            if(overflowsize > 0)
            {
                console.log('Radio folder is too big!');
                
                //получить самые старые файлы независимо от директории
                oldestfiles.oldestfiles(musicdirpath, function (err, files) {

                    if (err) {
                        console.log('Error: ' + err);
                        return;
                    }

                    //вычленить файлы общим размером равным в превышение
                    // files.reverse();

                    var countFilesToRemove = 0;
                    var totalSize = 0;
                    _.each(files, function (file) {
                        var stats = fs.statSync(file);
                        if(totalSize < overflowsize)
                        {
                            totalSize += stats["size"];
                            countFilesToRemove += 1;

                            fs.unlink(file, function (err) {
                                if (err) throw err;
                                console.log('successfully deleted '+file);
                            });
                            // console.log(countFilesToRemove+' ('+files.length+') '+totalSize+' ('+overflowsize+') : '+file);
                        }

                    });
                    // console.log(files)
                })
            }
            
            diskspace.check('/', function (total, free, status) {
                // console.log('total:  '+total);
                // console.log('free:   '+free);
                // console.log('status: '+status);
                
                if(free < 1000000000)
                {
                    console.log('Not enough space!');
                    //ПРИОСТАНОВИТЬ РИППИНГ
                }
                else
                {
                    //ПРОДОЛЖИТЬ РИППИНГ если остановлен
                }

            });
        });
    }, 10000)
    
    //чтение файла списка радиостанций
    console.log('Read station list');
    fs.readFile('./radiostationslist.json', 'utf8', function (err, data) {
        

        if (err) {

            //cоздание пустого файла радиостанций
            if(err.code == 'ENOENT')
            {
                fs.writeFile('./radiostationslist.json', "[]", function(err) {

                    if(err) {
                        console.log(err);
                    }
                    else
                    {
                        console.log('Empty radiostationslist.json file created.');
                    };

                }); 
            }
            else
            {
                console.log('Error: ' + err);
                return;
            };

        };
        
     
        var radiostationslist = JSON.parse(data);
     
        console.log(radiostationslist);

        //создание процессов риппинга
        console.log('Spawn streamripper processes');
        _.each(radiostationslist, function(station, index) {
            console.log(station.url+' added to ripping');
            
            if(station.stopped !== true)
            {
                var stationparams = [ station.url, '-d', musicdirpath];
                if(station.onair === true)
                {
                    stationparams.push('-r');
                }
                if(station.onefile === true)
                {
                    stationparams.push('-a');                    
                }
                console.log(stationparams);
                try{
                    childrens.push(spawn('streamripper', stationparams));
                }
                catch(e)
                {
                    console.log('Error when tried spawn ripper process for station:');
                    console.log(stationparams);
                }
            }
        });

        //чтение вывода каждого процесса
        if(logprocess)
        {
            _.each(childrens, function (children) {
                children.stdout.on('data', function(data) {
                    console.log(data.toString())
                    // process.stdout.write('\n'+data.toString());
                });
            });
        }
    });
});




// setTimeout(function() { process.exit(0) }, 3000);