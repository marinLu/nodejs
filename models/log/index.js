var express = require('express');
var router = express.Router();
module.exports = router;
var cFun = require('../utils/commonFunc');
var logDal=require('../dals/s_logDal');
var LogEntity=require('../entitys/s_logEntity');

router.post(
    "/report",
    cFun.awaitHandlerFactory(async (req, res, next) => {
        var reqBody=req.body;
        
        reqBody.head.userID

        var logs=[];
        for (let i = 0; i < reqBody.logs.length; i++) {
            const reqLog = reqBody.logs[i];
            var logEntity=new LogEntity();
            logEntity.logID=cFun.guid();
            logEntity.logType=reqLog.type;
            logEntity.logContent=reqLog.content;
            logEntity.logIP=cFun.getClientIp(req);
            logEntity.functionCode=reqLog.functionCode;
            logEntity.systemCode=reqBody.head.platform;
            logEntity.moduleCode=reqLog.moduleCode;
            logEntity.userID=reqBody.head.userID;

            logs.push(logEntity);
        }

        logDal.insertList(logs);

        return res.json(cFun.responseStatus(0, 'success'));
    })
);