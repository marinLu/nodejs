
var express = require('express');
var router = express.Router();
module.exports = router;
var cFun = require('../utils/commonFunc');
const modifyModelUtil = require("../utils/modifyDBUtil");
var functionDal = require('../dals/s_functionDal');
/* #region 获取所有的功能列表 */
// /**
//  * 获取功能列表
//  */
// router.post(
//     "/getFunctionList",
//     cFun.awaitHandlerFactory(async (req, res, next) => {
//         var functionList = await functionDal.getFunctionAll();
//         if (functionList == null || functionList.length == 0) {
//             return res.json(cFun.responseStatus(0, '没有相关的功能信息'));
//         }
//         var resBody = {
//             functionList: functionList
//         };

//         return res.json(
//             cFun.mergeJson(cFun.responseStatus(0, 'success'), resBody)
//         );
//     })
// );
//
/* #endregion */

/**
 *根据code获取功能列表
 */
router.post(
    "/getCodeFunctionList",
    cFun.awaitHandlerFactory(async (req, res, next) => {
        var reqBody = req.body;
        var functionList = null;
        if (reqBody.parentFunctionCode) {
            functionList = await functionDal.getparentFunctionCodeTwo(reqBody.parentFunctionCode);
        } else {
            functionList = await functionDal.getModuleCodeOne();
        }
        // else if (reqBody.functionCodes.length >= 0 && reqBody.systemCode) {
        //     functionList = await functionDal.getFunctionCodeAll(reqBody.functionCodes, reqBody.systemCode)
        // }
        if (functionList == null || functionList.length == 0) {
            return res.json(cFun.responseStatus(0, '没有相关的功能信息'));
        }
        var resBody = {
            functionList: functionList
        };

        return res.json(
            cFun.mergeJson(cFun.responseStatus(0, 'success'), resBody)
        );
    })
);


/**
 *前端根据code获取功能列表
 */
router.post(
    "/getViewCodeFunctionList",
    cFun.awaitHandlerFactory(async (req, res, next) => {
        var reqBody = req.body;
        var functionList = null;
        if (reqBody.parentFunctionCode) {
            functionList = await functionDal.getParentFunctionCode(reqBody.parentFunctionCode, reqBody.roleIDs);
        }
        if (functionList == null || functionList.length == 0) {
            return res.json(cFun.responseStatus(0, '没有相关的功能信息'));
        }
        var resBody = {
            functionList: functionList
        };

        return res.json(
            cFun.mergeJson(cFun.responseStatus(0, 'success'), resBody)
        );
    })
);
/**
 * 功能(增改数据)
 * req.body = {
 *  command : add-增、update-改
 *  
 * }
 */
router.post(
    "/functionModifyDepartment",
    cFun.awaitHandlerFactory(async (req, res, next) => {
        var command = req.body.command;
        if (!command) {
            console.log("缺少command");
            return res.json(cFun.responseStatus(-1, "缺少command信息"));
        }

        switch (command) {
            case "add":
                for (const datass of req.body.functionList) {
                    let info = await functionDal.getByCode(datass.functionCode);
                    if (info) {
                        return res.json(cFun.responseStatus(-4, "功能编码重复！"));
                    }
                    var recodes = {
                        functionID: cFun.guid(),
                        systemCode: "",
                        moduleCode: datass.moduleCode ? datass.moduleCode : "",
                        parentFunctionCode: datass.parentFunctionCode,
                        isValid: 0,
                        functionCode: datass.functionCode,
                        functionName: datass.functionName,
                        description: datass.description
                    }
                    var result = await modifyModelUtil.modifyModel("s_functionDal", "add", recodes);
                    if (result != 0) {
                        return res.json(cFun.responseStatus(-3, "插入数据失败", recodes));
                    }
                }
                break;
            /* #region  删除*/
            case "deleteAuthority":
                var results = await functionDal.querydel(`DELETE from s_function where functionID ='${req.body.functionID}'`);
                break;
            /* #endregion */
            case "update":
                for (const datas of req.body.functionList) {
                    if (datas)
                        var dataInfo = await functionDal.getByCode(req.body.functionCode);
                    if (dataInfo) {
                        var recodes = {
                            functionID: dataInfo.functionID,
                            systemCode: "",
                            moduleCode: dataInfo.moduleCode,
                            parentFunctionCode: dataInfo.parentFunctionCode,
                            isValid: 0,
                            functionCode: dataInfo.functionCode,
                            functionName: datas.functionName,
                            description: datas.description
                        }
                        var result = await modifyModelUtil.modifyModel("s_functionDal", "update", recodes);
                        if (result != 0) {
                            return res.json(cFun.responseStatus(-3, "插入数据失败", recodes));
                        }
                    }
                    /* #region 修改 */
                    // } else {
                    //     var recodes = {
                    //         functionID: cFun.guid(),
                    //         systemCode: datas.systemCode,
                    //         moduleCode: datas.moduleCode,
                    //         parentFunctionCode: datas.parentFunctionCode,
                    //         isValid: datas.isValid,
                    //         functionCode: datas.functionCode,
                    //         functionName: datas.functionName,
                    //         description: datas.description
                    //     }
                    //     var result = await modifyModelUtil.modifyModel("s_functionDal", "add", recodes);
                    /* #endregion */
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

/**
 *权限禁用启用
 */
router.post(
    "/isValidFunctionCode",
    cFun.awaitHandlerFactory(async (req, res, next) => {
        var reqBody = req.body;
        if (!reqBody.parentFunctionCode && !reqBody.isValid) {
            return res.json(cFun.responseStatus(-1, '参数为空'));
        }
        var functionInfo = await functionDal.getparentFunctionCodeTwo(reqBody.parentFunctionCode);
        // var json = res.json(cFun.mergeJson(functionInfo));
        var arr=[];
        arr.push(functionInfo);
        // var json =JSON.parse(functionInfo);
        // var arr = Array.prototype.slice.call(functionInfo);
        // var info = Array.isArray(arr)
        var tree = toTree(arr);
        if (functionInfo == null || functionInfo.length == 0) {
            return res.json(cFun.responseStatus(-1, '无权限记录！'));
        }
        for (const item of functionInfo) {
            item.isValid = reqBody.isValid
            await functionDal.update(item);
        }
        return res.json(
            cFun.mergeJson(cFun.responseStatus(0, 'success'))
        );
    })
);

function toTree(data) {
    // 删除 所有 children,以防止多次调用
    data.forEach(function (item) {
        delete item.children;
    });

    // 将数据存储为 以 id 为 KEY 的 map 索引数据列
    var map = {};
    data.forEach(function (item) {
        map[item.parentFunctionCode] = item;
    });
    //        console.log(map);
    var val = [];
    data.forEach(function (item) {
        // 以当前遍历项，的pid,去map对象中找到索引的id
        var parent = map[item.functionCode];
        // 好绕啊，如果找到索引，那么说明此项不在顶级当中,那么需要把此项添加到，他对应的父级中
        if (parent) {
            (parent.children || (parent.children = [])).push(item);
        } else {
            //如果没有在map中找到对应的索引ID,那么直接把 当前的item添加到 val结果集中，作为顶级
            val.push(item);
        }
    });
    return val;
}

