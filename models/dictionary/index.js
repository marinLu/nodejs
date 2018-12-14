var express = require('express');
var router = express.Router();
module.exports = router;
const cFun = require('../utils/commonFunc');
const dictionaryDal = require('../dals/s_dictionaryDal');
const dictionaryEntity = require('../entitys/s_dictionaryEntity');

router.post("/getByPaths", cFun.awaitHandlerFactory(async (req, res, next) => {
    var reqBody = req.body;
    var resBody = {
        datas: []
    }

    var dictionarys = await dictionaryDal.getByPaths(reqBody.paths);
    if (dictionarys == null || dictionarys.length == 0) {
        return res.json(cFun.responseStatus(0, '无数据'));
    }

    for (let i = 0; i < dictionarys.length; i++) {
        let dictionary = dictionarys[i];

        resBody.datas.push({
            dictionaryID: cFun.removeSpace(dictionary.dictionaryID),
            name: cFun.removeSpace(dictionary.name),
            typeName: cFun.removeSpace(dictionary.typeName),
            path: cFun.removeSpace(dictionary.path),
            insertTime: cFun.formatDateTime(dictionary.insertTime),
        });
    }

    return res.json(cFun.responseStatus(0, 'success', resBody));

}));
router.post("/getAllPath", cFun.awaitHandlerFactory(async (req, res, next) => {
    var reqBody = req.body;
    var resBody = {
        datas: []
    }

    var dictionarys = await dictionaryDal.getAllPath(reqBody.path);
    if (dictionarys == null || dictionarys.length == 0) {
        return res.json(cFun.responseStatus(0, '无数据'));
    }

    for (let i = 0; i < dictionarys.length; i++) {
        let dictionary = dictionarys[i];

        resBody.datas.push({
            dictionaryID: cFun.removeSpace(dictionary.dictionaryID),
            name: cFun.removeSpace(dictionary.name),
            typeName: cFun.removeSpace(dictionary.typeName),
            path: cFun.removeSpace(dictionary.path),
            insertTime: cFun.formatDateTime(dictionary.insertTime),
        });
    }

    return res.json(cFun.responseStatus(0, 'success', resBody));

}));

router.post("/updateAddLabel", cFun.awaitHandlerFactory(async (req, res, next) => {
    var reqBody = req.body;
    let path = "";
    if (reqBody.dictionaryID != null) {
        var dictionarys = await dictionaryDal.getByID(reqBody.dictionaryID);
        if (dictionarys == null || dictionarys.length == 0) {
            return res.json(cFun.responseStatus(0, '无数据'));
        }
        dictionarys.typeName = reqBody.typeName;
        dictionaryDal.update(dictionarys);
    } else {
        let name = "";
        if (reqBody.path.length > 21) {
            path = reqBody.path.substring(0, 21)
        } else {
            path = reqBody.path;
        }
        if (reqBody.name) {
            name = reqBody.name;
        } else {
            var dictionarysInfo = await dictionaryDal.getLikePathInfo(path);
            if (dictionarysInfo == null)
                return res.json(cFun.responseStatus(-1, 'name错误！'));
            name = parseInt(dictionarysInfo.name) + 1;
        }
        var dicEntity = new dictionaryEntity();
        dicEntity.dictionaryID = cFun.guid();
        dicEntity.name = name;
        dicEntity.typeName = reqBody.typeName;
        dicEntity.path = reqBody.path;
        dictionaryDal.insert(dicEntity);
    }

    return res.json(cFun.responseStatus(0, 'success'));

}));
router.post("/delsLabel", cFun.awaitHandlerFactory(async (req, res, next) => {
    var reqBody = req.body;
    if (reqBody.labelName.length > 0) {
        for (const itemName of reqBody.labelName) {
            await dictionaryDal.deleteLabel(itemName);
        }
    }
    for (const item of reqBody.dictionaryID) {
        await dictionaryDal.delete(item);
    }
    return res.json(cFun.responseStatus(0, 'success'));

}));