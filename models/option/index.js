var express = require('express');
var router = express.Router();
module.exports = router;
var cFun = require('../utils/commonFunc');
var optionDal = require('../dals/s_optionDal');
var OptionEntity = require('../entitys/s_optionEntity');

router.post(
    "/get",
    cFun.awaitHandlerFactory(async (req, res, next) => {
        var reqBody = req.body;

        var queryUserID='';
        if (!reqBody.isGlobal) {
            queryUserID=reqBody.head.userID;
        }

        var optionEntity =await optionDal.getByKeyUserID(reqBody.key,queryUserID);
        if (optionEntity == null) {
            return res.json(cFun.responseStatus(0, 'success'));
        }
        
        var resBody = {
            value: optionEntity.value,
            insertTime: optionEntity.insertTime,
            updateTime: optionEntity.updateTime
        }

        return res.json(cFun.responseStatus(0, 'success', resBody));
    })
);

router.post(
    "/set",
    cFun.awaitHandlerFactory(async (req, res, next) => {
        var reqBody = req.body;

        var queryUserID='';
        if (!reqBody.isGlobal) {
            queryUserID=reqBody.head.userID;
        }

        var optionInfo =await optionDal.getByKeyUserID(reqBody.key, queryUserID);
        if (optionInfo != null) {
            optionInfo.value=reqBody.value;
            optionDal.update(optionInfo);
        }else{
            var optionEntity=new OptionEntity();
            optionEntity.optionID=cFun.guid();
            optionEntity.key=reqBody.key;
            optionEntity.value=reqBody.value;
            optionEntity.userID=queryUserID;
            
            optionDal.insert(optionEntity);
        }


        return res.json(cFun.responseStatus(0, 'success'));
    })
);