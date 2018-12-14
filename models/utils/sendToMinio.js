const Minio = require("minio");
const config = require("../config");
/**
 * 
 * @param {首级栏目名} firstPart 
 * @param {二级栏目名} secondPart 
 * @param {传入的数据} data 
 */
module.exports.put = function SendToMinio(firstPart , secondPart, data) {
    var minio = new Minio.Client({  //连接MINIO的配置
      endPoint: '47.75.190.168',
      port: 9000,
      useSSL: false,
      accessKey: 'tsl',
      secretKey: 'Tsl@2018'

    });

    if(data == null)
    {
        return;
    }

    try {
        minio.putObject(firstPart , secondPart , data ,    
            function (err, etag) {
                 if (err) return console.log("error信息"+err)
                console.log('上传成功，具体文件地址是:'+ config().minioConfig.host+":"+config().minioConfig.port + secondPart)
        });
    }
    catch (error) {
      console.log(error);
    }
}


module.exports.fput = function SendToMinio(firstPart , secondPart, path , mataData) {
    var minio = new Minio.Client({  //连接MINIO的配置
    //   endPoint: '47.75.190.168',
    //   port: 9000,
    //   secure: false,
    //   accessKey: 'tsl',
    //   secretKey: 'Tsl@2018'

      endPoint: config().minioConfig.host,
      port: config().minioConfig.port,
      useSSL: false,
      accessKey: config().minioConfig.accessKey,
      secretKey: config().minioConfig.secretKey
    });

    if(path == null)
    {
        return;
    }
    console.log(firstPart);
    console.log(secondPart);
    // console.log(data.length);
    // console.log(data);

    try {
        minio.fPutObject(firstPart , secondPart , path , mataData ,   //参数1：栏目
            function (err, etag) {
                 if (err) return console.log("error信息"+err)
                console.log('上传成功，具体文件地址是:'+ config().minioConfig.host+":"+config().minioConfig.port + secondPart)
        });
    }
    catch (error) {
      console.log(error);
    }
}