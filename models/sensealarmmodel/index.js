
var express = require('express');
var router = express.Router();
module.exports = router;
var cFun = require('../utils/commonFunc');
const modifyModelUtil = require("../utils/modifyDBUtil");
var sensealarmmodelDal = require('../dals/e_sense_alarm_modelDal');
var sensealarmsceneDal = require('../dals/e_sense_alarm_sceneDal');
var sensealarmmodelEntity = require('../entitys/e_sense_alarm_modelEntity');

/**
 * 获取规则列表
 */
router.post(
    "/getSensealarmmodelList",
    cFun.awaitHandlerFactory(async (req, res, next) => {
        var reqBody = req.body;
        var sensealarmmodelList = await sensealarmmodelDal.getAllPage(Number(reqBody.pageNum), Number(reqBody.pageSize));
        var count = await sensealarmmodelDal.getAllPageCount();
        if (sensealarmmodelList == null || sensealarmmodelList.length == 0) {
            return res.json(cFun.responseStatus(0, '没有相关的功能信息'));
        }
        var resBody = {
            sensealarmmodelList: sensealarmmodelList,
            count: count
        };

        return res.json(
            cFun.mergeJson(cFun.responseStatus(0, 'success'), resBody)
        );
    })
);

/**
 * 获取已启用规则列表
 */
router.post(
    "/getSensealarmmodelIsvalidList",
    cFun.awaitHandlerFactory(async (req, res, next) => {
        var sensealarmmodelList = await sensealarmmodelDal.getSensealarmmodelIsvalidList();
        if (sensealarmmodelList == null || sensealarmmodelList.length == 0) {
            return res.json(cFun.responseStatus(0, '没有相关的功能信息'));
        }
        var resBody = {
            sensealarmmodelList: sensealarmmodelList,
        };
        return res.json(
            cFun.mergeJson(cFun.responseStatus(0, 'success'), resBody)
        );
    })
);
/**
 * 获取场景列表
 */
router.post(
    "/getSensealarmsceneList",
    cFun.awaitHandlerFactory(async (req, res, next) => {
        var reqBody = req.body;
        var sensealarmsceneList = await sensealarmsceneDal.getSceneAll();
        if (sensealarmsceneList == null || sensealarmsceneList.length == 0) {
            return res.json(cFun.responseStatus(0, '没有相关的功能信息'));
        }
        var resBody = {
            sensealarmsceneList: sensealarmsceneList,

        };

        return res.json(
            cFun.mergeJson(cFun.responseStatus(0, 'success'), resBody)
        );
    })
);

/**
 * 规则(增删改数据)
 * req.body = {
 *  command : add-增、delete-删、update-改
 *  
 * }
 */
router.post(
    "/sensealarmsceneModify",
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
                    modelID: cFun.guid(),
                    modelName: data.modelName,
                    modelCode: data.modelCode,
                    modelType: data.modelType,
                    modelRule: data.modelRule,
                    modelComments: data.modelComments,
                    groupName: data.groupName,
                    isValid: data.isValid,
                    isDelete: 0,
                    editUser: data.editUser,
                    sceneID: data.sceneID
                }
                var result = await modifyModelUtil.modifyModel("e_sense_alarm_modelDal", "add", recodes);
                if (result != 0) {
                    return res.json(cFun.responseStatus(-3, "插入数据失败", recodes));
                }
                break;



            case "delete":
                var results = [];
                for (const modelIDs of data.modelID) {
                    var result = await modifyModelUtil.modifyModel("e_sense_alarm_modelDal", "delete", null, modelIDs);
                    if (result != 0) {
                        results.push({
                            errorMsg: "删除数据失败",
                            errorDepartMentID: modelIDs
                        })
                    }
                }
                if (results.length > 0) {
                    return res.json(cFun.responseStatus(-3, "删除数据未成功", results))
                }
                break;

            case "update":
                var recodes = {
                    modelID: data.modelID[0],
                    modelName: data.modelName,
                    modelCode: data.modelCode,
                    modelType: data.modelType,
                    modelRule: data.modelRule,
                    modelComments: data.modelComments,
                    groupName: data.groupName,
                    isValid: data.isValid,
                    editUser: data.editUser,
                    sceneID: data.sceneID,
                    isDelete: 0,
                }
                var result = await modifyModelUtil.modifyModel("e_sense_alarm_modelDal", "update", recodes);
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


/**
 * 规则 启用关闭
 */
router.post(
    "/sensealarmsceneOnOff",
    cFun.awaitHandlerFactory(async (req, res, next) => {
        var reqBody = req.body;
        if (!reqBody.modelID)
            return res.json(cFun.responseStatus(-2, "modelID参数违法！"))
        for (const item of reqBody.modelID) {
            var info = await sensealarmmodelDal.getByModelID(item);
            if (!info)
                return res.json(cFun.responseStatus(-2, "修改无数据！"))
            info.isValid = reqBody.isValid,
                await sensealarmmodelDal.update(info);
        }
        return res.json(
            cFun.mergeJson(cFun.responseStatus(0, 'success'))
        );
    })
);