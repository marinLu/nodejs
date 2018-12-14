const inOutDal = require('../dals/b_in_outDal');
const cFun = require('../utils/commonFunc');
const parkingChannelDal = require('../dals/e_parking_channelDal');
const deviceDal = require('../dals/e_deviceDal');
const cameraDal = require('../dals/e_cameraDal');
const modifyModelUtil = require("../utils/modifyDBUtil");
var getInOutList =
    cFun.awaitHandlerFactory(async (req, res, next) => {
        var reqBody = req.body;

        var inoutList = await inOutDal.getByVillageIDs(Number(reqBody.pageNum), Number(reqBody.pageSize), reqBody.villageIDs);
        if (inoutList == null || inoutList.length == 0) {
            return res.json(cFun.responseStatus(0, '无出入口'));
        }
        var inoutCount = await inOutDal.countSum(reqBody.villageIDs);
        // var resInOuts = [];
        // for (let i = 0; i < inoutList.length; i++) {
        //     let inout = inoutList[i];

        //     resInOuts.push({
        //         villageID: inout.villageID,
        //         ioID: inout.ioID,
        //         name: inout.name,
        //         longitude: inout.longitude,
        //         insetTime
        //         latitude: inout.latitude,
        //         type: inout.type
        //     })
        // }

        var resBody = {
            inOuts: inoutList,
            inoutCount: inoutCount
        };
        return res.json(cFun.responseStatus(0, 'success', resBody));
    });
module.exports.getInOutList = getInOutList;

var getInOutDeviceList =
    cFun.awaitHandlerFactory(async (req, res, next) => {
        var reqBody = req.body;

        var inoutList = await inOutDal.getByIoIDs(reqBody.ioIDs);
        if (inoutList == null || inoutList.length == 0) {
            return res.json(cFun.responseStatus(-1, '不存在相关出入口信息'));
        }

        var resDevices = [];
        for (let i = 0; i < inoutList.length; i++) {
            let inout = inoutList[i];

            //车辆出入口
            if (inout.type == 0) {
                var parkingChannels = await parkingChannelDal.getByIoID(inout.ioID);
                if (parkingChannels != null && parkingChannels.length > 0) {

                    for (let i = 0; i < parkingChannels.length; i++) {
                        let parkingChannel = parkingChannels[i];
                        var resDevice = {
                            villageID: parkingChannel.villageID,
                            deviceID: parkingChannel.deviceID,
                            parkChanID: parkingChannel.parkChanID,
                            inout: cFun.inoutTypeChinese(parkingChannel.in_outType),
                            parkingID: parkingChannel.parkingID
                        };

                        var device = await deviceDal.getByDeviceID(parkingChannel.deviceID);
                        if (device != null) {
                            resDevice.type = device.type;
                            resDevice.name = device.name;

                            if (resDevice.type == 'camera') {
                                var camera = await cameraDal.getByDeviceID(device.deviceID);
                                resDevice.streamSource = camera.streamSource;
                            }
                        }

                        resDevices.push(resDevice);
                    }
                }
            }
        }


        var resBody = {
            devices: resDevices
        };
        return res.json(cFun.responseStatus(0, 'success', resBody));
    });
module.exports.getInOutDeviceList = getInOutDeviceList;


var getInoutInfo = cFun.awaitHandlerFactory(async (req, res, next) => { //获取楼栋
    var reqBody = req.body;

   
    var inout = await inoutDalDal.getByIoID(reqBody.ioID);
    return res.json(cFun.responseStatus(0, 'success', {
        inout: inout
    }));



});
module.exports.getInoutInfo = getInoutInfo;


var modifyInout = cFun.awaitHandlerFactory(async (req, res, next) => {
    var reqBody = req.body;
    var command = reqBody.command;
    var data = reqBody;
    if (!command) {
        console.log("缺少command");
        return res.json(cFun.responseStatus(-1, "缺少command信息"));
    }
    switch (command) {
        case "add":
            var recodes = {
                ioID: cFun.guid(),
                villageID: data.villageID,
                buildingID: data.buildingID,
                code: data.code,
                name: data.name,
                longitude: data.longitude,
                latitude: data.latitude,
                gisArea: data.gisArea,
                type: data.type,
                picUrl: data.picUrl,
            }
            var result = await modifyModelUtil.modifyModel("b_in_outDal", "add", recodes);
            if (result != 0) {
                return res.json(cFun.responseStatus(-3, "插入数据失败", recodes));
            }
            break;

        case "delete":
            var results = [];
            for (const iteminoutID of data.ioIDs) {
                var result = await modifyModelUtil.modifyModel("b_in_outDal", "delete", null, iteminoutID);
                if (result != 0) {
                    results.push({
                        errorMsg: "删除数据失败",
                        erroriteminoutID: iteminoutID
                    })
                }
            }
            if (results.length > 0) {
                return res.json(cFun.responseStatus(-3, "删除数据未成功", results))
            }
            break;

        case "update":
            var recodes = {
                ioID: data.ioIDs[0],
                villageID: data.villageID,
                buildingID: data.buildingID,
                code: data.code,
                name: data.name,
                longitude: data.longitude,
                latitude: data.latitude,
                gisArea: data.gisArea,
                type: data.type,
                picUrl: data.picUrl,
            }
            var result = await modifyModelUtil.modifyModel("b_in_outDal", "update", recodes);
            if (result != 0) {
                return res.json(cFun.responseStatus(-3, "更改数据失败", recodes));
            }
            break;
        default:
            return res.json(cFun.responseStatus(-2, "command指令有误"))
    }
    return res.json(
        cFun.mergeJson(cFun.responseStatus(0, 'success'))
    );
})

module.exports.modifyInout = modifyInout;
