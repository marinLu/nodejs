if (process.env.NODE_ENV != 'production') {
    process.env.DB_NAME = 'blueplus';
    process.env.DB_USERNAME = 'root';
    process.env.DB_PASSWORD = 'Tsl@2018';
    process.env.DB_HOST = '192.168.10.96';
    process.env.DB_PORT = '3306';
    process.env.DB_DIALECT = 'mysql';
    process.env.ELS_HOST = '220.248.34.75:9200';
    process.env.MQTT_HOST = 'ws://220.248.34.75:3000';
    process.env.REDIS_HOST = '220.248.34.75';
    process.env.REDIS_PORT = '6379';

    // process.env.DB_NAME = 'blueplus_xh';
    // process.env.DB_USERNAME = 'root';
    // process.env.DB_PASSWORD = 'Tsl@2018';
    // process.env.DB_HOST = '31.0.178.232';
    // process.env.DB_PORT = '3306';
    // process.env.DB_DIALECT = 'mysql';
    // process.env.ELS_HOST = '47.75.190.168:9200';
    // process.env.MQTT_HOST = 'ws://31.0.178.231:3000';
    // process.env.REDIS_HOST = '106.75.249.247';
    // process.env.REDIS_PORT = '6379';


    // process.env.DB_NAME = 'blueplus_cn';
    // process.env.DB_USERNAME = 'root';
    // process.env.DB_PASSWORD = '123456';
    // process.env.DB_HOST = '10.207.120.129';
    // process.env.DB_PORT = '3306';
    // process.env.DB_DIALECT = 'mysql';
    // process.env.MQTT_HOST = 'ws://10.207.120.128:3000';
    // process.env.REDIS_HOST = '10.207.120.128';
    // process.env.REDIS_PORT = '6379';
     // process.env.REDIS_SWITCH='OFF';
}

module.exports = function () {
    if (process.env.NODE_ENV == 'product') {
        return productConfig;
    } else {
        return devConfig;
    }
}

//开发配置
var devConfig = {
    host: {
        hostName: "47.75.190.168",
        port: 5000
    },
    //设备报警时间间隔（间隔内多次报警视为一次报警）
    deviceAlarmTimeInterval: {
        fence: 60
    },
    alarmLevel: {
        break: 4,
        offline: 4,
        invasion: 4,
        fire: 1,
        agedSos: 1,
        doorOpen: 2,
        parkCar: 3,
        chargeAlert: 1,
        manholeCoverOpen: 4,
        waterLevelAlert: 4,
        voltageAlert: 4,
        waterPressureAlert: 4,
        gasAlert: 1,
        fireCockOpen: 2,
        waterOut: 2,
        parkingCarExceed: 3
    },
    minioConfig: {
        host: '47.75.190.168',
        port: 9000,
        carBucket: 'blueplus',
        faceBucket: 'face',
        accessKey: 'tsl',
        secretKey: 'Tsl@2018'
    }
}

//生产配置
var productConfig = {

}