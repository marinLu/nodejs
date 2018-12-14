const cFun = require('../utils/commonFunc');
const modifyModelUtil = require("../utils/modifyDBUtil");
var bikeshedDal = require('../dals/e_bikeshedDal');




var modifyBikeshed = cFun.awaitHandlerFactory(async (req, res, next) => {
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
                bikeshedID: cFun.guid(),
                villageID: data.villageID,
                name: data.name,
                code: data.code,
                longitude: data.longitude,
                latitude: data.latitude,
                type: data.type,
                gisArea: data.gisArea,
                cameraIDs: data.cameraIDs,
            }
            var result = await modifyModelUtil.modifyModel("e_bikeshedDal", "add", recodes);
            if (result != 0) {
                return res.json(cFun.responseStatus(-3, "插入数据失败", recodes));
            }
            break;

        case "delete":
            var results = [];
            for (const itembikeshedID of data.bikeshedID) {
                var result = await modifyModelUtil.modifyModel("e_bikeshedDal", "delete", null, itembikeshedID);
                if (result != 0) {
                    results.push({
                        errorMsg: "删除数据失败",
                        errorParkingID: itembikeshedID
                    })
                }
            }
            if (results.length > 0) {
                return res.json(cFun.responseStatus(-3, "删除数据未成功", results))
            }
            break;

        case "update":
            var recodes = {
                bikeshedID: data.bikeshedID,
                villageID: data.villageID,
                parkingID: data.parkingID,
                name: data.name,
                code: data.code,
                longitude: data.longitude,
                latitude: data.latitude,
                type: data.type,
                gisArea: data.gisArea,
                cameraIDs: data.cameraIDs,
            }
            var result = await modifyModelUtil.modifyModel("e_bikeshedDal", "update", recodes);
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

module.exports.modifyBikeshed = modifyBikeshed;

var getBikeshedList = cFun.awaitHandlerFactory(async (req, res, next) => { //获取楼栋
    var reqBody = req.body;

    var bikesheds = await bikeshedDal.getByPage(Number(reqBody.pageNum), Number(reqBody.pageSize), reqBody.villageID);
    console.log(bikesheds.length);
    if (bikesheds == null || bikesheds.length == 0) {
        return res.json(
            cFun.responseStatus(0, "无数据")
        );
    }
    var bikeshedCount = await bikeshedDal.count(reqBody.villageID);
    return res.json(cFun.responseStatus(0, 'success', {
        bikesheds: bikesheds, bikeshedCount: bikeshedCount
    }));



});
module.exports.getBikeshedList = getBikeshedList;



var getBikeshedInfo = cFun.awaitHandlerFactory(async (req, res, next) => { //获取楼栋
    var reqBody = req.body;

   
    var bikeshed = await bikeshedDal.getByBikeshedID(reqBody.bikeshedID);
    return res.json(cFun.responseStatus(0, 'success', {
        bikeshed: bikeshed
    }));



});
module.exports.getBikeshedInfo = getBikeshedInfo;