const cFun = require('../utils/commonFunc');
const modifyModelUtil = require("../utils/modifyDBUtil");
var parkingchannelDal = require('../dals/e_parking_channelDal');
var modifyParkingChannel = cFun.awaitHandlerFactory(async (req, res, next) => {
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
                parkChanID: cFun.guid(),
                parkingID: data.parkingID,
                villageID: data.villageID,
                ioID: data.ioID,
                deviceID: data.deviceID,
                channelNo: data.channelNo,
                in_outType: data.in_outType,
            }
            var result = await modifyModelUtil.modifyModel("e_parking_channelDal", "add", recodes);
            if (result != 0) {
                return res.json(cFun.responseStatus(-3, "插入数据失败", recodes));
            }
            break;

        case "delete":
            var results = [];
            for (const itemparkChanID of data.parkChanIDs) {
                var result = await modifyModelUtil.modifyModel("e_parking_channelDal", "delete", null, itemparkChanID);
                if (result != 0) {
                    results.push({
                        errorMsg: "删除数据失败",
                        errorParkingID: itemparkChanID
                    })
                }
            }
            if (results.length > 0) {
                return res.json(cFun.responseStatus(-3, "删除数据未成功", results))
            }
            break;

        case "update":
            var recodes = {
                parkChanID: data.parkChanIDs[0],
                parkingID: data.parkingID,
                villageID: data.villageID,
                ioID: data.ioID,
                deviceID: data.deviceID,
                channelNo: data.channelNo,
                in_outType: data.in_outType,
            }
            var result = await modifyModelUtil.modifyModel("e_parking_channelDal", "update", recodes);
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

module.exports.modifyParkingChannel = modifyParkingChannel;

var getParkingChannelList = cFun.awaitHandlerFactory(async (req, res, next) => { //获取列表
    var reqBody = req.body;

    var parkings = await parkingchannelDal.getByPage(Number(reqBody.pageNum), Number(reqBody.pageSize), reqBody.villageIDs);
    if (parkings == null || parkings.length == 0) {
        return res.json(
            cFun.responseStatus(0, "无数据")
        );
    }
    var parkingCount = await parkingchannelDal.count(reqBody.villageIDs);
    return res.json(cFun.responseStatus(0, 'success', {
        parkings: parkings, parkingCount: parkingCount
    }));



});
module.exports.getParkingChannelList = getParkingChannelList;