const cFun = require('../utils/commonFunc');
const parkingLogDal = require('../dals/e_parking_logDal');
const parkingChannelDal = require('../dals/e_parking_channelDal');
const parkingDal = require('../dals/e_parkingDal');
const deviceDal = require('../dals/e_deviceDal');
const cameraDal = require('../dals/e_cameraDal');
const villagheDal = require('../dals/b_villageDal');
const resourceDal = require('../dals/s_resourceDal');
const statisticSql = require('../statistic/statisticSql');
const parkingCarDal = require('../dals/e_parking_carDal');
const peopleDal = require("../dals/p_peopleDal");
const redis = require('blueplus-redis');
const redisKey = require('../utils/redisKey');
const modifyDBUtil = require("../utils/modifyDBUtil");

var getParkingInfo =
    cFun.awaitHandlerFactory(async (req, res, next) => {
        var reqBody = req.body;

        var parkingInfo = await parkingDal.getByParkingID(reqBody.parkingID);
        if (parkingInfo == null) {
            return res.json(cFun.responseStatus(-1, '不存在该停车场'));
        }

        var parkingChannels = await parkingChannelDal.getParkingID(parkingInfo.parkingID);
        if (parkingChannels == null || parkingChannels.length == 0) {
            return res.json(cFun.responseStatus(-1, '不存在车道'));
        }

        var deviceIDs = Array.from(new Set(parkingChannels.map(x => x.deviceID)));
        var deviceList = await deviceDal.getByDeviceIDs(deviceIDs);

        var resParkingChannels = [];
        for (let i = 0; i < parkingChannels.length; i++) {
            let parkingChannel = parkingChannels[i];

            var streamSource = '';

            var device = cFun.firstOrDefault(deviceList.filter(x => x.deviceID == parkingChannel.deviceID));
            if (device != null && device.type != null &&
                device.type != '' && device.type.indexOf('camera') >= 0) {
                var camera = await cameraDal.getByDeviceID(device.deviceID);
                if (camera != null) {
                    streamSource = camera.streamSource;
                }
            }

            resParkingChannels.push({
                parkChanID: parkingChannel.parkChanID,
                deviceID: parkingChannel.deviceID,
                channelNo: parkingChannel.channelNo,
                inout: cFun.inoutTypeChinese(parkingChannel.in_outType),
                streamSource: streamSource
            });
        }

        if (resParkingChannels.length == 0) {
            return res.json(cFun.responseStatus(-1, '没有停车信息'));
        }

        var resBody = {
            parkingChannels: resParkingChannels
        };

        return res.json(cFun.responseStatus(0, 'success', resBody));
    });
module.exports.getParkingInfo = getParkingInfo;

var getCarLogs =
    cFun.awaitHandlerFactory(async (req, res, next) => {
        var reqBody = req.body;

        var parkingChannel = await parkingChannelDal.getByParkChanID(reqBody.parkChanID);
        if (parkingChannel == null) {
            return res.json(cFun.responseStatus(-1, '未找到车辆卡口'));
        }


        var startTime = cFun.formatDateTime(new Date(), 'yyyy-MM-dd');
        var endTime = cFun.formatDateTime(new Date());
        var parkingLogs = await parkingLogDal.getByParkChanID(parkingChannel.parkChanID, startTime, endTime);
        if (parkingLogs == null || parkingLogs.length == 0) {
            return res.json(cFun.responseStatus(0, '未找到通行记录'));
        }

        var resParkingLogs = [];
        var platePicResource = await resourceDal.getByBusinessIDs('parkingLog', 'url', [parkingChannel.villageID]);
        var path = '';
        if (platePicResource != null && platePicResource.length > 0) {
            path = platePicResource[0].filePath;
        } else {
            var resources = await resourceDal.getBusinessType('parkingLog');
            path = resources[0].filePath;
        }

        //车牌号
        var registerCars = null;
        var registerCarInfo = await redis.getAsync(redisKey.parkRegisterCars(parkingChannel.parkingID));
        if (registerCarInfo == null) {
            registerCars = await parkingCarDal.getByParkingID(parkingChannel.parkingID);

            if (registerCars != null && registerCars.length > 0) {
                redis.set(redisKey.parkRegisterCars(parkingChannel.parkingID), JSON.stringify(registerCars), 60 * 60)
            }
        } else {
            registerCars = cFun.jsonTryParse(registerCarInfo);
        }

        for (let i = 0; i < parkingLogs.length; i++) {
            let parkingLog = parkingLogs[i];

            resParkingLogs.push({
                plateNo: parkingLog.plateNo,
                passTime: parkingLog.inOutTime,
                inout: cFun.inoutTypeChinese(parkingLog.in_outType),
                minPlatePic: path + parkingLog.minPlatePic,
                platePic: path + parkingLog.platePic,
                isRegister: _.findIndex(registerCars, x => x.plateNo == parkingLog.plateNo) >= 0 ? 1 : 0
            });
        }

        var resBody = {
            parkingLogs: resParkingLogs
        };

        return res.json(cFun.responseStatus(0, 'success', resBody));
    });
module.exports.getCarLogs = getCarLogs;

var getCarStatic =
    cFun.awaitHandlerFactory(async (req, res, next) => {
        var reqBody = req.body;

        var parkingInfo = await parkingDal.getByParkingID(reqBody.parkingID);
        if (parkingInfo == null) {
            return res.json(cFun.responseStatus(-1, '无此停车场'));
        }

        var villageInfo = await villagheDal.getByVillageID(parkingInfo.villageID);
        if (villageInfo == null) {
            return res.json(cFun.responseStatus(-1, '无此停车场'));
        }

        // var parkChannels = await parkingChannelDal.getParkingID(reqBody.parkingID);
        // if (parkChannels == null || parkChannels.length == 0) {
        //     return res.json(cFun.responseStatus(0, '无行车记录'));
        // }

        // var inChannelIDs = parkChannels.filter(x => x.in_outType == 0).map(x => x.parkChanID);
        // var outChannelIDs = parkChannels.filter(x => x.in_outType == 1).map(x => x.parkChanID);

        // var startTime = cFun.formatDateTime(new Date(), 'yyyy-MM-dd');
        // var endTime = cFun.formatDateTime(new Date());
        // var parkingLogs = await parkingLogDal.getList(parkChannels.map(x => x.parkChanID),
        //     startTime, endTime)

        statisticSql.车辆实时通行数量(villageInfo.villageID);

        var inNum = await statisticSql.小区停车场当日驶入数量(villageInfo.villageID);
        var outNum = await statisticSql.小区停车场当日驶出数量(villageInfo.villageID);
        var captureNum = await statisticSql.小区停车场抓拍总数(villageInfo.villageID);

        var resBody = {
            inNum: inNum, //parkingLogs.filter(x => cFun.exist(inChannelIDs, x.parkChanID)).length,
            outNum: outNum, //parkingLogs.filter(x => cFun.exist(outChannelIDs, x.parkChanID)).length,
            captureNum: captureNum, //parkingLogs.length,
            detainNum: villageInfo.curParkingCount,
            excessNum: 0,
            availableNum: villageInfo.parkingCount > villageInfo.curParkingCount ? villageInfo.parkingCount - villageInfo.curParkingCount : 0,
            currentNum: villageInfo.curParkingCount
        };

        return res.json(cFun.responseStatus(0, 'success', resBody));
    });
module.exports.getCarStatic = getCarStatic;

var getPeopleCar =
    cFun.awaitHandlerFactory(async (req, res, next) => {
        var reqBody = req.body;

        var peopleCars = await parkingCarDal.getByPeopleID(reqBody.peopleID);

        var cars = [];
        for (let i = 0; i < peopleCars.length; i++) {
            let peopleCar = peopleCars[i];

            cars.push({
                carID: peopleCar.carID,
                parkingID: peopleCar.parkingID,
                plateNo: peopleCar.plateNo
            })
        }


        return res.json(cFun.responseStatus(0, 'success', {
            cars: cars
        }));
    });
module.exports.getPeopleCar = getPeopleCar;

/**
 * 接口：/localCar/add        /localCar/update
 * req.body : {
 *      data:[{
 *          s_department数据库的各个字段
 *      }],
 *      head : {
            token
            timestamp
            platform
        }
 * }
 * 
 * 接口/localCar/delete
 * req.body : {
 *      data:[carID字符串数组]
 *      head : {
            token
            timestamp
            platform
        }
 * }
 * 
 * 接口：/localCar/find
 *  req.body : {
        data:{
            pageSize        每页大小
            pageNum         页数
            orderBy         通过哪个字段进行排序
            selectColumn    需要查看数据库显示的列数
            where           查询的条件
        }
        head : {
            token
            timestamp
            platform
        }
    }
 */
var modifyCar = cFun.awaitHandlerFactory(async (req, res, next) => {
    var command = req.params.modify;
    if (!command || (command != "add" && command != "delete" && command != "update" && command != "find")) {
        return res.json(cFun.responseStatus(-1, "路径有误"))
    }

    var data = req.body.data;

    switch (command) {
        case "add":
            if (!data || data.length == 0) {
                return res.json(cFun.responseStatus(-1, "缺少新增本地车辆的数据"))
            }
            data[0]["carID"] = cFun.guid();
            var result = await modifyDBUtil.modifyModel("e_parking_carDal", "add", data[0]);
            if (result != 0) {
                return res.json(cFun.responseStatus(-3, "插入数据失败", data[0]));
            }
            break;
        case "delete":
            if (!data || data.length == 0) {
                return res.json(cFun.responseStatus(-1, "缺少删除本地车辆的数据"))
            }
            var results = [];
            for (const itemData of data) {
                var result = await modifyDBUtil.modifyModel("e_parking_carDal", "delete", null, itemData);
                if (result != 0) {
                    results.push({
                        errorMsg: "删除数据失败",
                        errorData: itemData.departmentDal
                    })
                }
            }
            if (results.length > 0) {
                return res.json(cFun.responseStatus(-3, "删除数据未成功", results))
            }
            break;
        case "update":
            if (!data || data.length == 0) {
                return res.json(cFun.responseStatus(-1, "缺少更改本地车辆的数据"))
            }
            var result = await modifyDBUtil.modifyModel("e_parking_carDal", "update", data[0]);
            if (result != 0) {
                return res.json(cFun.responseStatus(-3, "更改数据失败", data));
            }
            break;
        case "find":
            /*
             * reqBody : {
                pageSize
                pageNum
                orderBy
                selectColumn
                where 
             }
             */
            var data = req.body.data;
            if (cFun.isNullOrEmpty(data.pageNum) || cFun.isNullOrEmpty(data.pageSize) || data.pageSize == 0) {
                return res.json(cFun.responseStatus(-1, "缺少参数pageNum或pageSize"))
            }

            var selectResults = await modifyDBUtil.getDBRecodes("e_parking_carDal", "e_parking_car", data);

            if(!selectResults || selectResults.resultData.length == 0){
                return res.json(cFun.responseStatus(0, "success",selectResults));
            }

            var results = [];

            for (const item of selectResults.resultData) {
                var data = {};
                for (var key in item) {
                    data[key] = item[key];
                }
    
                var parkingData = await parkingDal.query(`select aa.name as parkingName, aa.villageID as villageID, b_village.name as villageName from  b_village inner join (select * from e_parking where parkingID = "${item.parkingID}") AS aa on aa.villageID = b_village.villageID `);
                if(parkingData && parkingData.length > 0){
                    data["villageName"] = parkingData[0].villageName;
                    data["parkingName"] = parkingData[0].parkingName;
                    data["villageID"] = parkingData[0].villageID;
                }
    
                var peopleData = await peopleDal.getByPeopleID(item.peopleID);
                if(peopleData){
                    data["peopleName"] = peopleData.peopleName;
                }
                
                results.push(data);

            }

            return res.json(cFun.responseStatus(0, "success",
            {
                resultCount:selectResults.resultCount,
                resultData:results
            }));
        default:
            break;
    }

    return res.json(cFun.responseStatus(0, "success"));

})
module.exports.modifyCar = modifyCar;