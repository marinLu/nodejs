var express = require('express');
var router = express.Router();
module.exports = router;

const cFun = require('../utils/commonFunc');
const alarm = require('./alarm');
const device = require('./device');
const people = require('./people');
const car = require('./car');
const accessLog = require('./accessLog');
const wkface = require('./wkface');
const wkcar = require('./wkcar');
const logQuery=require('./log');

router.post("/functionCode", cFun.awaitHandlerFactory(async (req, res, next) => {

    var reqBody = req.body;

    if (reqBody.functionCode == null || reqBody.functionCode == '') {
        return res.json(cFun.responseStatus(-1, '无functionCode或functionCode为空'));
    }

    if (reqBody.pageNum < 1) {
        return res.json(cFun.responseStatus(-1, '页码从1开始'));
    }

    if (reqBody.pageSize < 1) {
        return res.json(cFun.responseStatus(-1, 'pageSize小于1'), {
            data: []
        });
    }

    switch (reqBody.functionCode) {
        case 'yujin': //报警查询
            {
                var resBody = await alarm(reqBody.head, reqBody.condition, reqBody.pageNum, reqBody.pageSize);
                return res.json(cFun.responseStatus(0, 'success', resBody));
            }
        case 'shebei': //设备查询
            {
                var resBody = await device(reqBody.head, reqBody.condition, reqBody.pageNum, reqBody.pageSize);
                return res.json(cFun.responseStatus(0, 'success', resBody));
            }
        case 'renkou': //人口查询
            {
                var resBody = await people(reqBody.head, reqBody.condition, reqBody.pageNum, reqBody.pageSize);
                return res.json(cFun.responseStatus(0, 'success', resBody));
            }
        case 'cheliang': //车辆查询
            {
                var resBody = await car(reqBody.head, reqBody.condition, reqBody.pageNum, reqBody.pageSize);
                return res.json(cFun.responseStatus(0, 'success', resBody));
            }
        case 'tongxing': //通行查询
            {
                var resBody = await accessLog(reqBody.head, reqBody.condition, reqBody.pageNum, reqBody.pageSize);
                return res.json(cFun.responseStatus(0, 'success', resBody));
            }
        case 'wkface': //微卡人脸查询
            {
                var resBody = await wkface(reqBody.head, reqBody.condition, reqBody.pageNum, reqBody.pageSize);
                return res.json(cFun.responseStatus(0, 'success', resBody));
            }
        case 'wkcar': //微卡车辆查询
            {
                var resBody = await wkcar(reqBody.head, reqBody.condition, reqBody.pageNum, reqBody.pageSize);
                return res.json(cFun.responseStatus(0, 'success', resBody));
            }
        case 'log': //微卡车辆查询
            {
                var resBody = await logQuery(reqBody.head, reqBody.condition, reqBody.pageNum, reqBody.pageSize);
                return res.json(cFun.responseStatus(0, 'success', resBody));
            }
        default:
            {
                return res.json(cFun.responseStatus(-1, 'functionCode错误'), {
                    data: []
                });
            }
    }
}));