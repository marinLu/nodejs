var process = require('child_process');

module.exports.createEigenValue = function ( inputJpg, outputJpg, eigenValue) {
    process.exec('cd ./face_x64', function (error, stdout, stderr) {
        if (error !== null) {
            console.log('exec error: ' + error);
            return -1;
        }
        process.exec(`./face.sh ./data ${inputJpg} ${outputJpg} ${eigenValue}`,function(error , stdout,stderr){
            if(error){
                console.log("exec error: "+error);
                return -1;
            }

            return eigenValue;
        })
    });
}