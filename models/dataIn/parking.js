const cFun = require('../utils/commonFunc');
const alarmLogDal = require('../dals/e_alarm_logDal');
const device = require('../dals/e_deviceDal');
const e_parkingDal = require("../dals/e_parkingDal");
const e_parking_carDal = require("../dals/e_parking_carDal");
const e_parking_logDal = require('../dals/e_parking_logDal');
const e_parking_reserveDal = require('../dals/e_parking_reserveDal');
const s_resource = require("../dals/s_resourceDal");
const e_parking_logEntity = require('../entitys/e_parking_logEntity');
const e_parking_reserveEntity = require('../entitys/e_parking_reserveEntity');
const config = require('../config');
const dateFormat = require("../utils/dateFormat");
const sendMQ = require("../utils/sendMQ")

var carParking = cFun.awaitHandlerFactory(async (req, res, next) => {
    var reqBody = req.body;
    // console.log(JSON.stringify(reqBody));
    var channelNo = req.query.channelNo;    //取出请求的设备channelNo，用来确定设备
    console.log("channelNo:"+channelNo);
    var deviceList = await device.query("select * from e_parking_channel where channelNo = '" +  channelNo + "'");
    if (deviceList == null || deviceList.length == 0) {
        return res.json(cFun.responseStatus(-1, '没有相关channelNo'));
    } 
    
    if(reqBody.channelType){
        deviceList[0].in_outType = parseInt(reqBody.channelType);
    }

    var plateNo = reqBody.plateNo;
    var passTime = new Date();

    //生成路径
    var platePic = reqBody.platePic;
    var minPlatePic = reqBody.minPlatePic;

    var parkingLog = new e_parking_logEntity();
    parkingLog.parkingLogID = cFun.guid();
    parkingLog.villageID = deviceList[0].villageID;
    parkingLog.parkChanID = deviceList[0].parkChanID;
    parkingLog.plateNo = plateNo;
    parkingLog.in_outType = deviceList[0].in_outType;
    parkingLog.platePic = platePic;
    parkingLog.minPlatePic = minPlatePic;
    parkingLog.inOutTime = passTime;

    e_parking_logDal.insert(parkingLog);
    
    if(deviceList[0].in_outType == 0)
    {
        var parkingReserve = new e_parking_reserveEntity();

        parkingReserve.parkingReserveID = cFun.guid();
        parkingReserve.villageID = deviceList[0].villageID;
        parkingReserve.parkingID = deviceList[0].parkingID;
        parkingReserve.plateNo = plateNo ;
        parkingReserve.inParkingLogID =  parkingLog.parkingLogID;
       
        e_parking_reserveDal.insert(parkingReserve);
    }
    else if(deviceList[0].in_outType == 1)
    {
        var hisParking = await e_parking_reserveDal.query("select * from e_parking_reserve where plateNo = '" + plateNo + "' order by insertTime desc limit 1");
        if(hisParking != null && hisParking.length > 0)
        {
            if(hisParking[0].inParkingLogID != null || hisParking[0].inParkingLogID != '' )
            {
                hisParking[0].outParkingLogID = parkingLog.parkingLogID;
                e_parking_reserveDal.update( hisParking[0]);
                return res.json(cFun.responseStatus(0, 'success'));
            }
        }
        else
        {
            var parkingReserve = new e_parking_reserveEntity();

            parkingReserve.parkingReserveID = cFun.guid();
            parkingReserve.villageID = deviceList[0].villageID;
            parkingReserve.parkingID = deviceList[0].parkingID;
            parkingReserve.plateNo = plateNo ;
            parkingReserve.outParkingLogID =  parkingLog.parkingLogID;
           
            e_parking_reserveDal.insert(parkingReserve);
        }
    }
    
    //查找停车场
    var parking = await e_parkingDal.query("select * from e_parking where villageID = '"+parkingLog.villageID+"';");
    
    if(parking == null || parking.length == 0 ){
        return res.json(cFun.responseStatus(-1,"没有相关停车场"))
    }

    var parkingCar = await e_parking_carDal.query("select * from e_parking_car where plateNo= '"+parkingLog.plateNo+"';");

    var isRegister = 0;
    if(parkingCar && parkingCar.length > 0){
        isRegister = 1;
    }

    var resources = await s_resource.query("select * from s_resource where businessType = 'parkingLog' and businessID = '"+deviceList[0].villageID+"'");
 

    var data = {
        platePic: (!resources || resources.length == 0) ? 
            'http://' + config().minioConfig.host + ':' + config().minioConfig.port +'/' + config().minioConfig.carBucket + "/" + parkingLog.platePic
            : resources[0].filePath+parkingLog.platePic,//全景图片
        minPlatePic: (!resources || resources.length == 0) ? 
            'http://' + config().minioConfig.host + ':' + config().minioConfig.port +'/' + config().minioConfig.carBucket + "/" + parkingLog.minPlatePic
            : resources[0].filePath+parkingLog.minPlatePic,//车牌图片
        passTime: dateFormat.changeDateFullFormat(parkingLog.inOutTime),//过车时间 yyyy-MM-dd HH:mm:ss
        parkingName:parking[0].name,       //停车场名称
        plateNo: parkingLog.plateNo, //车牌号
        in_outType: deviceList[0].in_outType == '1'?0:1,//0=进 1=出
        Longitude:parking[0].longitude,
        Latitude:parking[0].latitude,
        isRegister: isRegister,
        villageID : parking[0].villageID
    };

    sendMQ('/web/event/map/parkingLog' , data);

    return res.json(cFun.responseStatus(0, 'success'));

});


module.exports.carParking = carParking;