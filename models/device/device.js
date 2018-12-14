const deviceDal = require('../dals/e_deviceDal');
const cFun = require('../utils/commonFunc');
const deviceHelper = require('./helper');
const houseDal = require('../dals/b_houseDal');
const buildingDal = require('../dals/b_buildingDal');
const cameraDal = require('../dals/e_cameraDal');
const dictionaryDal = require('../dals/s_dictionaryDal');
const villageDal = require('../dals/b_villageDal');
const optionDal = require('../dals/s_optionDal');
const deviceEntity=require('../entitys/e_deviceEntity');
const moment = require('moment')
const accessDal = require("../dals/e_accessDal");

var getDeviceList = cFun.awaitHandlerFactory(async (req, res, next) => {

    
    var deviceList = await deviceDal.getlist(req.body.villageIDs, req.body.types, parseInt(req.body.pageNum), parseInt(req.body.pageSize), req.body.state);
    if (deviceList == null) {
        return res.json(cFun.responseStatus(0, '没有相关的设备信息'));
    }
    // 获取设备总数
    var deviceCount = await deviceDal.getDeviceListCount(req.body.villageIDs, req.body.types)
    var dictionarys = await dictionaryDal.getByPath('db/e_device/type');

    var buildings = await buildingDal.getByVillageIDs(req.body.villageIDs);

    var cameraDeviceIDs = deviceList.filter(x => x.type == 'camera').map(x => x.deviceID);
    var cameras = await cameraDal.getByDeviceIDs(cameraDeviceIDs);

    //deviceList
    // deviceList = deviceList.filter(x => x.type != 'camera' || (x.type == 'camera' && cFun.isNullOrEmpty(x.buildingID)));

    var devices = [];
    // 获取当前时间
    let nowDay = moment(new Date()).format("YYYY-MM-DD HH:mm:ss")
    for (let i = 0; i < deviceList.length; i++) {
        var buildingInfo = cFun.firstOrDefault(buildings.filter(x => x.buildingID == deviceList[i].buildingID));

        let installTime = deviceList[i].installTime;
        let du = moment.tz(moment(nowDay) - moment(installTime), "Africa/Abidjan").format('HH时mm分ss秒')
        let day = cFun.timeDifference(installTime, nowDay, 'day');
        let differenceStr = day + "天" + du;
        var device = {
            villageID:deviceList[i].villageID,
            name: deviceList[i].name,
            longitude: deviceList[i].longitude,
            latitude: deviceList[i].latitude,
            deviceID: deviceList[i].deviceID,
            type: deviceList[i].type,
            typeName: cFun.getTypeName(dictionarys, deviceList[i].type),
            state: deviceList[i].state,
            buildingID: deviceList[i].buildingID,
            buildingNo: buildingInfo == null ? '' : buildingInfo.buildingNo,
            houseID: deviceList[i].houseID,
            deviceParams: deviceList[i].deviceParams,
            differenceStr: differenceStr,
            code: deviceList[i].code,
            isDisable: deviceList[i].isDisable,
            insertTime: deviceList[i].insertTime,
            installTime: deviceList[i].installTime
        };

        if (deviceHelper.isCamera(deviceList[i].type)) {
            var camera = cameras.filter(x => x.deviceID == deviceList[i].deviceID)[0];
            if (camera != null) {
                device.streamSource = camera.streamSource;
                device.type = deviceHelper.getCameraDeviceType(camera.useType);
                device.typeName = deviceHelper.getCameraDeviceTypeName(camera.useType);
            }
        }

        // 判断是否是门禁
        if (req.body.pageNum != null && req.body.pageNum >= 1 && req.body.pageSize != null && req.body.pageSize >= 1) {
            if (deviceHelper.isAccess(deviceList[i].type)) {
                let accessInfo = await accessDal.getByDeviceID(deviceList[i].deviceID)
                if (accessInfo != null) {
                    device.accessLockState = accessInfo.lockState
                } 
            }
        }
        devices.push(device);
    }

    if (req.body.pageNum != null && req.body.pageNum >= 1 && req.body.pageSize != null && req.body.pageSize >= 1) {
        // 以后如果还要加排序做备用
    } else {
        var orders = await optionDal.getByKey('deviceTypeOrder');
        if (orders != null && orders.length > 0) {
            devices = deviceHelper.devicesOrder(devices, JSON.parse(orders[0].value));
        }
    }
    


    var resBody = {
        deviceList: devices,
        deviceCount: deviceCount
    };

    return res.json(
        cFun.mergeJson(cFun.responseStatus(0, 'success'), resBody)
    );
});
module.exports.getDeviceList = getDeviceList;

var getDeviceListByPaging = cFun.awaitHandlerFactory(async (req, res, next) => {

    
    var deviceList = await deviceDal.getlistByPaging(req.body.villageIDs, req.body.types, parseInt(req.body.pageNum), parseInt(req.body.pageSize), req.body.state, req.body.order);
    if (deviceList == null) {
        return res.json(cFun.responseStatus(0, '没有相关的设备信息'));
    }
    // 获取设备总数
    var deviceCount = await deviceDal.getDeviceListCountBypaging(req.body.villageIDs, req.body.types, req.body.state)
    var dictionarys = await dictionaryDal.getByPath('db/e_device/type');

    var buildings = await buildingDal.getByVillageIDs(req.body.villageIDs);

    var cameraDeviceIDs = deviceList.filter(x => x.type == 'camera').map(x => x.deviceID);
    var cameras = await cameraDal.getByDeviceIDs(cameraDeviceIDs);

    //deviceList
    // deviceList = deviceList.filter(x => x.type != 'camera' || (x.type == 'camera' && cFun.isNullOrEmpty(x.buildingID)));

    var devices = [];
    // 获取当前时间
    let nowDay = moment(new Date()).format("YYYY-MM-DD HH:mm:ss")
    for (let i = 0; i < deviceList.length; i++) {
        var buildingInfo = cFun.firstOrDefault(buildings.filter(x => x.buildingID == deviceList[i].buildingID));

        let installTime = deviceList[i].installTime;
        let du = moment.tz(moment(nowDay) - moment(installTime), "Africa/Abidjan").format('HH时mm分ss秒')
        let day = cFun.timeDifference(installTime, nowDay, 'day');
        let differenceStr = day + "天" + du;
        var device = {
            villageID:deviceList[i].villageID,
            name: deviceList[i].name,
            longitude: deviceList[i].longitude,
            latitude: deviceList[i].latitude,
            deviceID: deviceList[i].deviceID,
            type: deviceList[i].type,
            typeName: cFun.getTypeName(dictionarys, deviceList[i].type),
            state: deviceList[i].state,
            buildingID: deviceList[i].buildingID,
            buildingNo: buildingInfo == null ? '' : buildingInfo.buildingNo,
            houseID: deviceList[i].houseID,
            deviceParams: deviceList[i].deviceParams,
            differenceStr: differenceStr,
            code: deviceList[i].code,
            isDisable: deviceList[i].isDisable,
            insertTime: deviceList[i].insertTime,
            installTime: deviceList[i].installTime
        };

        if (deviceHelper.isCamera(deviceList[i].type)) {
            var camera = cameras.filter(x => x.deviceID == deviceList[i].deviceID)[0];
            if (camera != null) {
                device.streamSource = camera.streamSource;
                device.type = deviceHelper.getCameraDeviceType(camera.useType);
                device.typeName = deviceHelper.getCameraDeviceTypeName(camera.useType);
            }
        }

        // 判断是否是门禁
        if (req.body.pageNum != null && req.body.pageNum >= 1 && req.body.pageSize != null && req.body.pageSize >= 1) {
            if (deviceHelper.isAccess(deviceList[i].type)) {
                let accessInfo = await accessDal.getByDeviceID(deviceList[i].deviceID)
                if (accessInfo != null) {
                    device.accessLockState = accessInfo.lockState
                } 
            }
        }
        devices.push(device);
    }

    if (req.body.pageNum != null && req.body.pageNum >= 1 && req.body.pageSize != null && req.body.pageSize >= 1) {
        // 以后如果还要加排序做备用
    } else {
        var orders = await optionDal.getByKey('deviceTypeOrder');
        if (orders != null && orders.length > 0) {
            devices = deviceHelper.devicesOrder(devices, JSON.parse(orders[0].value));
        }
    }
    


    var resBody = {
        deviceList: devices,
        deviceCount: deviceCount
    };

    return res.json(
        cFun.mergeJson(cFun.responseStatus(0, 'success'), resBody)
    );
});
module.exports.getDeviceListByPaging = getDeviceListByPaging;

var getDeviceCount = cFun.awaitHandlerFactory(async (req, res, next) => {
    var deviceList = await deviceDal.getlist(req.body.villageIDs, req.body.types);
    if (deviceList == null) {
        return res.json(cFun.responseStatus(0, '没有相关的设备信息'));
    }

    var dictionarys = await dictionaryDal.getByPath('db/e_device/type');
    if (dictionarys == null || dictionarys.length == 0) {
        return res.json(cFun.responseStatus(-1, '设备字典访问失败'));
    }

    var deviceNumInfo = [];
    for (let i = 0; i < dictionarys.length; i++) {
        const dictionary = dictionarys[i];
        var devices = deviceList.filter(x => cFun.removeSpace(x.type) ==
            cFun.removeSpace(dictionary.name));

        if (devices != null && devices.length > 0) {
            deviceNumInfo.push({
                total: devices.length,
                exTotal: devices.filter(x => x.state != 1).length,
                type: dictionary.name,
                name: dictionary.typeName
            });
        }
    }

    if (deviceNumInfo.length == 0) {
        return res.json(cFun.responseStatus(-1, '未获取到设备'));
    }

    var resBody = {
        deviceNumInfo: deviceNumInfo
    };

    return res.json(cFun.responseStatus(0, 'success', resBody));

});
module.exports.getDeviceCount = getDeviceCount;


var getDeviceInfo = cFun.awaitHandlerFactory(async (req, res, next) => {
    var reqBody = req.body;

    var deviceInfo = await deviceDal.getByDeviceID(reqBody.deviceID);
    if (deviceInfo == null) {
        return res.json(cFun.responseStatus(-1, '没有相关的设备信息'));
    }

    var resBody = {
        deviceInfo: deviceInfo
    };

    return res.json(cFun.responseStatus(0, 'success', resBody));
});
module.exports.getDeviceInfo = getDeviceInfo;


var addDevice = cFun.awaitHandlerFactory(async (req, res, next) => {
    let DeviceInfo = req.body.deviceInfo;
    let CameraInfo = req.body.cameraInfo;
    let AccessInfo = req.body.accessInfo;
    let type = req.body.type;
    // 默认新增设备
    switch (type) {
        case "access": 
        await controllAccess(DeviceInfo, AccessInfo, "insert")
        break
        case "camera":
        await controllCamera(DeviceInfo, CameraInfo, "insert")
        break
        default:
        await controllDevice(DeviceInfo, "insert")
    }
    return res.json(cFun.responseStatus(0, 'success'));
})
module.exports.addDevice = addDevice

var controllDevice = async function (DeviceInfo, type) {
    switch (type) {
        case "insert":
        await deviceDal.addDevice(DeviceInfo)
        break
        case "update":
        await deviceDal.update(DeviceInfo)
        break
        case "delete":
        break
        default:
        return
    }
    return 
}

var controllCamera = async function (DeviceInfo, CameraInfo, type) {
    switch (type) {
        case "insert":
        await deviceDal.addCameraDevice(DeviceInfo, CameraInfo)
        break
        case "update":
        await deviceDal.updateCameraDevice(DeviceInfo, CameraInfo)
        break
        case "delete":
        break
        default:
        return
    }
    
    return 
}

var controllAccess = async function (DeviceInfo, AccesssInfo, type) {
    switch (type) {
        case "insert":
        await deviceDal.addAccessDevice(DeviceInfo, AccesssInfo)
        break
        case "update":
        await deviceDal.updateAccessDevice(DeviceInfo, AccesssInfo)
        break
        case "delete":
        break
        default:
        return
    }
    return 
}

// 修改设备
var updateDeviceInfo = cFun.awaitHandlerFactory(async (req, res, next) => {
    let DeviceInfo = req.body.deviceInfo;
    let CameraInfo = req.body.cameraInfo;
    let AccessInfo = req.body.accessInfo;
    let type = req.body.type;
    // 需要判断设备是否存在
    var deviceInfo = await deviceDal.getByDeviceID(DeviceInfo.deviceID);
    if (deviceInfo == null) {
        return res.json(cFun.responseStatus(-1, '没有相关的设备信息'));
    }

    // 默认修改设备
    switch (type) {
        case "access": 
        var accessInfo = await accessDal.getByDeviceID(DeviceInfo.deviceID)
        if (accessInfo == null) {
            return res.json(cFun.responseStatus(0, '没有相关的设备信息'));
        }
        await controllAccess(DeviceInfo, AccessInfo, "update")
        break
        case "camera":
        var cameraInfo = await cameraDal.getByDeviceID(DeviceInfo.deviceID)
        if (cameraInfo == null) {
            return res.json(cFun.responseStatus(0, '没有相关的设备信息'));
        }
        await controllCamera(DeviceInfo, CameraInfo, "update")
        break
        default:
        await controllDevice(DeviceInfo, "update")
    }
    return res.json(cFun.responseStatus(0, 'success'));
})
module.exports.updateDeviceInfo = updateDeviceInfo

var delDevice = cFun.awaitHandlerFactory(async (req, res, next) => {
    let DeviceIDList = req.body.deviceIDList;
    // 需要判断设备是否存在
    for(let [index, elem] of DeviceIDList.entries())
    {
        await deviceDal.delDevice(elem)
    }
    // var deviceInfo = await deviceDal.getByDeviceID(DeviceID);
    // if (deviceInfo == null) {
    //     return res.json(cFun.responseStatus(-1, '没有相关的设备信息'));
    // }
    
    // 开始删除
    // deviceInfo.isDelete = 1
    
    return res.json(cFun.responseStatus(0, 'success'));
})
module.exports.delDevice = delDevice

var getDeviceDetialByType = cFun.awaitHandlerFactory(async (req, res, next) => {
    let DeviceID = req.body.deviceID;
    let type = req.body.type;
    let resBody = {
        deviceInfo: ""
    };
    // 需要判断设备是否存在
    switch (type) {
        case "access": 
        var accessInfo = await accessDal.queryByDeviceID(DeviceID)
        if (accessInfo == null) {
            return res.json(cFun.responseStatus(0, '没有相关的设备信息'));
        }
        resBody.deviceInfo = accessInfo[0];
        return res.json(cFun.responseStatus(0, 'success', resBody));
        case "camera":
        var cameraInfo = await cameraDal.queryByDeviceID(DeviceID)
        if (cameraInfo == null) {
            return res.json(cFun.responseStatus(0, '没有相关的设备信息'));
        }
        resBody.deviceInfo = cameraInfo[0]
        return res.json(cFun.responseStatus(0, 'success', resBody));
        default:
        
        var deviceInfo = await deviceDal.queryByDeviceID(DeviceID);
        if (deviceInfo == null) {
            return res.json(cFun.responseStatus(-1, '没有相关的设备信息'));
        }
        resBody.deviceInfo = deviceInfo[0];
        return res.json(cFun.responseStatus(0, 'success', resBody));
    }
})
module.exports.getDeviceDetialByType = getDeviceDetialByType

var changeDeviceDisable = cFun.awaitHandlerFactory(async (req, res, next) => {
    let DeviceIDList = req.body.deviceIDList;
    for(let [index, elem] of DeviceIDList.entries())
    {
        // 开始更新
        deviceDal.changeDeviceDisable([elem, elem])
    }
    return res.json(cFun.responseStatus(0, 'success'));
})
module.exports.changeDeviceDisable = changeDeviceDisable


var getCameraInOut = cFun.awaitHandlerFactory(async (req, res, next) => {
    let HouseID = req.body.houseID;
    // 需要判断设备是否存在
    let result = await deviceDal.getCameraInOut([HouseID])
    let inArr = []
    let outArr = []
    for(let [index, elem] of result.entries())
    {
        if (elem.inOutFlag == 0) {
            inArr.push(elem)
        } else if (elem.inOutFlag == 1) {
            outArr.push(elem)
        }
    }

    let resBody = {
        inArr: inArr,
        outArr: outArr
    };

    return res.json(cFun.responseStatus(0, 'success', resBody));
})
module.exports.getCameraInOut = getCameraInOut


var deviceNameExist = cFun.awaitHandlerFactory(async (req, res, next) => {
    let DeviceID = req.body.deviceID;
    let DeviceName = req.body.name;
    // 需要判断设备是否存在
    let deviceCount = await deviceDal.deviceNameExist(DeviceID, DeviceName) 
    let result 
    if (deviceCount > 0) {
        result = true
    } else {
        result = false
    }
    let resBody = {
        result: result
    };

    return res.json(cFun.responseStatus(0, 'success', resBody));
})
module.exports.deviceNameExist = deviceNameExist



