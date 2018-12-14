const cFun = require('../utils/commonFunc');
const modifyModelUtil = require("../utils/modifyDBUtil");
var parkingDal = require('../dals/e_parkingDal');



var modifyParking = cFun.awaitHandlerFactory(async (req, res, next) => {
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
                parkingID: cFun.guid(),
                villageID: data.villageID,
                name: data.name,
                code: data.code,
                parkNum: data.parkNum,
                longitude: data.longitude,
                latitude: data.latitude,
                type: data.type
            }
            var result = await modifyModelUtil.modifyModel("e_parkingDal", "add", recodes);
            if (result != 0) {
                return res.json(cFun.responseStatus(-3, "插入数据失败", recodes));
            }
            break;

        case "delete":
            var results = [];
            for (const itemparkingID of data.parkingID) {
                var result = await modifyModelUtil.modifyModel("e_parkingDal", "delete", null, itemparkingID);
                if (result != 0) {
                    results.push({
                        errorMsg: "删除数据失败",
                        errorParkingID: itemparkingID
                    })
                }
            }
            if (results.length > 0) {
                return res.json(cFun.responseStatus(-3, "删除数据未成功", results))
            }
            break;

        case "update":
            var recodes = {
                parkingID: data.parkingID[0],
                villageID: data.villageID,
                name: data.name,
                code: data.code,
                parkNum: data.parkNum,
                longitude: data.longitude,
                latitude: data.latitude,
                type: data.type
            }
            var result = await modifyModelUtil.modifyModel("e_parkingDal", "update", recodes);
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

module.exports.modifyParking = modifyParking;

var getParkingList = cFun.awaitHandlerFactory(async (req, res, next) => { //获取楼栋
    var reqBody = req.body;

    var parkings = await parkingDal.getByPage(Number(reqBody.pageNum), Number(reqBody.pageSize), reqBody.villageID);
    console.log(parkings.length);
    if (parkings == null || parkings.length == 0) {
        return res.json(
            cFun.responseStatus(0, "无数据")
        );
    }
    var parkingCount = await parkingDal.count(reqBody.villageID);
    return res.json(cFun.responseStatus(0, 'success', {
        parkings: parkings, parkingCount: parkingCount
    }));



});
module.exports.getParkingList = getParkingList;



var getParkingInfo = cFun.awaitHandlerFactory(async (req, res, next) => { //获取楼栋
    var reqBody = req.body;

   
    var parking = await parkingDal.getByParkingID(reqBody.parkingID);
    return res.json(cFun.responseStatus(0, 'success', {
        parking: parking
    }));



});
module.exports.getParkingInfo = getParkingInfo;