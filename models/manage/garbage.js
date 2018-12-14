const cFun = require('../utils/commonFunc');
const modifyModelUtil = require("../utils/modifyDBUtil");
var garbageDal = require('../dals/e_garbageDal');



var modifyGarbage = cFun.awaitHandlerFactory(async (req, res, next) => {
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
                garbageID: cFun.guid(),
                villageID: data.villageID,
                name: data.name,
                code: data.code,
                longitude: data.longitude,
                latitude :data.latitude,
                type:data.type,
                gisArea: data.gisArea
            }
            var result = await modifyModelUtil.modifyModel("e_garbageDal", "add", recodes);
            if (result != 0) {
                return res.json(cFun.responseStatus(-3, "增加数据失败", results))
            }
            break;

        case "update":
            var recodes = {
                garbageID: data.garbageID,
                villageID: data.villageID,
                name: data.name,
                code: data.code,
                longitude: data.longitude,
                type: data.type,
                gisArea: data.gisArea,
                latitude: data.latitude,
                type: data.type,
                gisArea: data.gisArea,
                cameraIDs: data.cameraIDs
            }
            var result = await modifyModelUtil.modifyModel("e_garbageDal", "update", recodes);
            if (result != 0) {
                return res.json(cFun.responseStatus(-3, "插入数据失败", recodes));
            }
            break;

        case "delete":
            var results = [];
            for (const itemgarbageID of data.garbageID) {
                var result = await modifyModelUtil.modifyModel("e_garbageDal", "delete", null, itemgarbageID);
                if (result != 0) {
                    results.push({
                        errorMsg: "删除数据失败",
                        errorGarbageID: itemgarbageID
                    })
                }
            }
            if (results.length > 0) {
                return res.json(cFun.responseStatus(-3, "更改数据失败", results));
            }
            break;
        default:
            return res.json(cFun.responseStatus(-2, "command指令有误"))
    }

    return res.json(
        cFun.mergeJson(cFun.responseStatus(0, 'success'))
    );
})

module.exports.modifyGarbage = modifyGarbage;

var getGarbageList = cFun.awaitHandlerFactory(async (req, res, next) => { //获取楼栋
    var reqBody = req.body;

    var garbages = await garbageDal.getByPage(Number(reqBody.pageNum), Number(reqBody.pageSize), reqBody.villageID);
    console.log(garbages.length);
    if (garbages == null || garbages.length == 0) {
        return res.json(
            cFun.responseStatus(0, "无数据")
        );
    }
    var garbageCount = await garbageDal.count(reqBody.villageID);
    return res.json(cFun.responseStatus(0, 'success', {
        garbages: garbages, garbageCount: garbageCount
    }));
});
module.exports.getGarbageList = getGarbageList;



var getGarbageInfo = cFun.awaitHandlerFactory(async (req, res, next) => { //获取楼栋
    var reqBody = req.body;

   
    var garbage = await garbageDal.getByGarbageID(reqBody.garbageID);
    return res.json(cFun.responseStatus(0, 'success', {
        garbage: garbage
    }));
});
module.exports.getGarbageInfo = getGarbageInfo;



