const cFun = require('../utils/commonFunc');
const modifyModelUtil = require("../utils/modifyDBUtil");
var facelDal = require('../dals/e_faceDal');
var modifyface = cFun.awaitHandlerFactory(async (req, res, next) => {
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
                faceID: cFun.guid(),
                villageID: data.villageID,
                ioID: data.ioID,
                deviceID: data.deviceID,
                channelNo: data.channelNo,
                in_outType: data.in_outType
            }
            var result = await modifyModelUtil.modifyModel("e_faceDal", "add", recodes);
            if (result != 0) {
                return res.json(cFun.responseStatus(-3, "插入数据失败", recodes));
            }
            break;

        case "delete":
            var results = [];
            for (const itemfaceID of data.faceIDs) {
                var result = await modifyModelUtil.modifyModel("e_faceDal", "delete", null, itemfaceID);
                if (result != 0) {
                    results.push({
                        errorMsg: "删除数据失败",
                        errorParkingID: itemfaceID
                    })
                }
            }
            if (results.length > 0) {
                return res.json(cFun.responseStatus(-3, "删除数据未成功", results))
            }
            break;

        case "update":
            var recodes = {
                faceID: data.faceIDs[0],
                villageID: data.villageID,
                ioID: data.ioID,
                deviceID: data.deviceID,
                channelNo: data.channelNo,
                in_outType: data.in_outType
            }
            var result = await modifyModelUtil.modifyModel("e_faceDal", "update", recodes);
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

module.exports.modifyface = modifyface;

var getfaceList = cFun.awaitHandlerFactory(async (req, res, next) => { //获取列表
    var reqBody = req.body;

    var faces = await facelDal.getByPage(Number(reqBody.pageNum), Number(reqBody.pageSize), reqBody.villageIDs);
    if (faces == null || faces.length == 0) {
        return res.json(
            cFun.responseStatus(0, "无数据")
        );
    }
    var facesCount = await facelDal.count(reqBody.villageIDs);
    return res.json(cFun.responseStatus(0, 'success', {
        faces: faces, facesCount: facesCount
    }));



});
module.exports.getfaceList = getfaceList;