var express = require('express');
var router = express.Router();
module.exports = router;
var cFun = require('../utils/commonFunc');
const modifyModelUtil = require("../utils/modifyDBUtil");
var departmentDal = require('../dals/s_departmentDal');

/**
 * 获取所有部门列表
 */
router.post(
    "/getDepartmentList",
    cFun.awaitHandlerFactory(async (req, res, next) => {
        var reqBody = req.body;
        let departmentList = null;
        let count = await departmentDal.getByParentID();
        if (Number(reqBody.pageNum) <= 0 && Number(reqBody.pageSize) <= 0) {
            departmentList = await departmentDal.getByParentID();
        }
        else {
            departmentList = await departmentDal.getByPage(Number(reqBody.pageNum), Number(reqBody.pageSize));
        }
        if (departmentList == null || departmentList.length == 0) {
            return res.json(cFun.responseStatus(0, '没有相关的部门信息'));
        }
        count = count.length;
        var departments = [];
        for (let i = 0; i < departmentList.length; i++) {
            departments.push({
                departmentID: departmentList[i].departmentID,
                code: departmentList[i].code,
                name: departmentList[i].name,
                parentID: departmentList[i].parentID,
                level: departmentList[i].level,
                description: departmentList[i].description,
                isValid: departmentList[i].isValid,
                isUnit: departmentList[i].isUnit,
                insertTime: cFun.formatDateTime(departmentList[i].insertTime),
                updateTime: cFun.formatDateTime(departmentList[i].updateTime)

            });
        }

        var resBody = {
            deviceList: departments,
            count: count
        };

        return res.json(
            cFun.mergeJson(cFun.responseStatus(0, 'success'), resBody)
        );
    })
);
/**
 * 获取已启用的部门列表
 */
router.post(
    "/getByIsValidAll",
    cFun.awaitHandlerFactory(async (req, res, next) => {
        let departmentList  = await departmentDal.getByIsValid();
        var departments = [];
        for (let i = 0; i < departmentList.length; i++) {
            departments.push({
                departmentID: departmentList[i].departmentID,
                code: departmentList[i].code,
                name: departmentList[i].name,
                parentID: departmentList[i].parentID,
                level: departmentList[i].level,
                description: departmentList[i].description,
                isValid: departmentList[i].isValid,
                isUnit: departmentList[i].isUnit,
                insertTime: cFun.formatDateTime(departmentList[i].insertTime),
                updateTime: cFun.formatDateTime(departmentList[i].updateTime)

            });
        }

        var resBody = {
            deviceList: departments,
        };
        return res.json(
            cFun.mergeJson(cFun.responseStatus(0, 'success'), resBody)
        );
    })
);
/**
 * 部门(增删改数据)
 * req.body = {
 *  command : add-增、delete-删、update-改
 *  data : [
 *     { departmentID      code      name    parentID    isValid     isUnit      level       orderNum        description }
 *  ]
 * }
 */
router.post(
    "/modifyDepartment",
    cFun.awaitHandlerFactory(async (req, res, next) => {
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
                    departmentID: cFun.guid(),
                    // code: data.code,
                    name: data.name,
                    // parentID: 111,
                    isValid: data.isValid,
                    isUnit: data.isUnit,
                    level: data.level,
                    orderNum: data.orderNum,
                    description: data.description
                }
                var result = await modifyModelUtil.modifyModel("s_departmentDal", "add", recodes);
                if (result != 0) {
                    return res.json(cFun.responseStatus(-3, "插入数据失败", recodes));
                }
                break;

            case "delete":
                var results = [];
                for (const itemDepartmentID of data.departmentID) {
                    var result = await modifyModelUtil.modifyModel("s_departmentDal", "delete", null, itemDepartmentID);
                    if (result != 0) {
                        results.push({
                            errorMsg: "删除数据失败",
                            errorDepartMentID: itemDepartmentID
                        })
                    }
                }
                if (results.length > 0) {
                    return res.json(cFun.responseStatus(-3, "删除数据未成功", results))
                }
                break;

            case "update":
                var recodes = {
                    departmentID: data.departmentID[0],
                    // code: data.code,
                    name: data.name,
                    // parentID: data.parentID,
                    isValid: data.isValid,
                    isUnit: data.isUnit,
                    level: data.level,
                    orderNum: data.orderNum,
                    description: data.description
                }
                var result = await modifyModelUtil.modifyModel("s_departmentDal", "update", recodes);
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
);