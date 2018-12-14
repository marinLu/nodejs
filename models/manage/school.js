const cFun = require('../utils/commonFunc');
const modifyModelUtil = require("../utils/modifyDBUtil");
var schoolDal = require('../dals/e_schoolDal');



var modifySchool = cFun.awaitHandlerFactory(async (req, res, next) => {
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
                schoolID: cFun.guid(),
                villageID: data.villageID,
                name: data.name,
                code: data.code,
                longitude: data.longitude,
                latitude: data.latitude,
                type: data.type,
                gisArea: data.gisArea,
                cameraIDs: data.cameraIDs,
            }
            var result = await modifyModelUtil.modifyModel("e_schoolDal", "add", recodes);
            if (result != 0) {
                return res.json(cFun.responseStatus(-3, "插入数据失败", recodes));
            }
            break;

        case "delete":
            var results = [];
            for (const itemschoolID of data.schoolID) {
                var result = await modifyModelUtil.modifyModel("e_schoolDal", "delete", null, itemschoolID);
                if (result != 0) {
                    results.push({
                        errorMsg: "删除数据失败",
                        itemschoolID: itemschoolID
                    })
                }
            }
            if (results.length > 0) {
                return res.json(cFun.responseStatus(-3, "删除数据未成功", results))
            }
            break;

        case "update":
            var recodes = {
                schoolID: data.schoolID,
                villageID: data.villageID,
                name: data.name,
                code: data.code,
                longitude: data.longitude,
                latitude: data.latitude,
                type: data.type,
                gisArea: data.gisArea,
                cameraIDs: data.cameraIDs,
            }
            var result = await modifyModelUtil.modifyModel("e_schoolDal", "update", recodes);
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

module.exports.modifySchool = modifySchool;

var getSchoolList = cFun.awaitHandlerFactory(async (req, res, next) => { //获取楼栋
    var reqBody = req.body;

    var schools = await schoolDal.getByPage(Number(reqBody.pageNum), Number(reqBody.pageSize), reqBody.villageID);
    console.log(schools.length);
    if (schools == null || schools.length == 0) {
        return res.json(
            cFun.responseStatus(0, "无数据")
        );
    }
    var schoolsCount = await schoolDal.count(reqBody.villageID);
    return res.json(cFun.responseStatus(0, 'success', {
        schools: schools, schoolsCount: schoolsCount
    }));
});
module.exports.getSchoolList = getSchoolList;



var getSchoolInfo = cFun.awaitHandlerFactory(async (req, res, next) => { //获取楼栋
    var reqBody = req.body;

   
    var school = await schoolDal.getBySchoolID(reqBody.schoolID);
    return res.json(cFun.responseStatus(0, 'success', {
        school: school
    }));
});
module.exports.getSchoolInfo = getSchoolInfo;



