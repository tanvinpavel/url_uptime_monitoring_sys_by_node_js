//dependence
const fs = require('fs');
const path = require('path');

//scaffolding obj
const lib = {};

//base directory
const baseDir = path.join("__dirname", '/../.data/');

//create & write
lib.create = (dir, file, data, callBack) => {
    fs.open(baseDir+dir+'/'+file+'.json', 'wx', (error, fileDescriptor) => {
        if(!error && fileDescriptor){
            //string data
            const strData = JSON.stringify(data);
            fs.writeFile(fileDescriptor, strData, (error) => {
                if(!error){
                    fs.close(fileDescriptor, (error) => {
                        if(!error){
                            callBack(false);
                        }else{
                            callBack('failed to close file');
                        }
                    })
                }else{
                    callBack('failed to write file');
                }
            })
        }else{
            callBack('failed to open file, file already exists');
        }
    })
}

//read
lib.read = (dir, file, callBack) => {
    fs.readFile(baseDir+dir+'/'+file+'.json', (error, data) => {
        // const realData = JSON.parse(data);
        callBack(error, data);
    })
}

//update
lib.update = (dir, file, data, callBack) => {
    fs.open(baseDir+dir+'/'+file+'.json', "r+", (error, fileDescriptor) => {
        if(!error && fileDescriptor){
            fs.ftruncate(fileDescriptor, (error) => {
                if(!error){
                    //string data
                    const strData = JSON.stringify(data);
                    fs.writeFile(fileDescriptor, strData, (error) => {
                        if(!error){
                            fs.close(fileDescriptor, (error) => {
                                if(!error){
                                    callBack(false);
                                }else{
                                    callBack('failed to close file');
                                }
                            })
                        }else{
                            callBack('failed to write data');
                        }
                    })
                }else{
                    callBack('failed to truncate');
                }
            })
        }else{
            callBack('failed writing the document');
        }
    })
}

//delete
lib.delete = (dir, file, callBack) => {
    fs.unlink(baseDir+dir+'/'+file+'.json', (error) => {
        if(!error){
            callBack(false);
        }else{
            callBack('failed to delete file');
        }
    })
}

lib.list = (dir, callBack) => {
    fs.readdir(`${baseDir+dir}/`, (err, fileNames) => {
        if(!err && fileNames.length > 0){
            const trimmedFileNames = [];
            fileNames.forEach(fileName => {
                trimmedFileNames.push(fileName.replace('.json',''));
            })
            callBack(false, trimmedFileNames)
        }else{
            callBack('Error reading directory');
        }
    })
}

//export
module.exports = lib;
