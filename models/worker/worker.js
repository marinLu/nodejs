const cFun = require('../utils/commonFunc');
const workerDal = require('../dals/p_workerDal');
const WorkerEntity = require('blueplus-dals').p_workerEntity;
const prosterDal = require('../dals/p_rosterDal');
const prosterEntity = require('../entitys/p_rosterEntity');
var getPageWorkerAll = cFun.awaitHandlerFactory(async (req, res, next) => { //根据登陆的用户获取所有的工作人员
    var reqBody = req.body;
    if (reqBody.pageSize.length == "") {

        reqBody.pageSize = 10;
    }
    if (reqBody.pageNum.length == "") {

        reqBody.pageNum = 1;
    }
    var workerList = await workerDal.getPageWorkerList(Number(reqBody.pageNum), Number(reqBody.pageSize), reqBody.villageIDs);
    var count = await workerDal.getPageWorkerListCount(reqBody.villageIDs);
    return res.json(cFun.responseStatus(0, 'success', {
        workerList: workerList,
        count: count
    }));
});
module.exports.getPageWorkerAll = getPageWorkerAll;


var getRosterByWorkerID = cFun.awaitHandlerFactory(async (req, res, next) => { //获取排班人员根据工作人员
    var reqBody = req.body;
    var prosterList = await prosterDal.getRosterByWorkerID(reqBody.workerID);
    return res.json(cFun.responseStatus(0, 'success', {
        prosterList: prosterList
    }));
});
module.exports.getRosterByWorkerID = getRosterByWorkerID;
var updateAddWorker = cFun.awaitHandlerFactory(async (req, res, next) => { //修改添加工作人员
    var reqBody = req.body;
    if (reqBody.workerID) {
        var workerInfo = await workerDal.getByWorkerID(reqBody.workerID);
        workerInfo.committeeID = reqBody.committeeID;
        workerInfo.villageID = reqBody.villageID;
        workerInfo.streetID = reqBody.streetID;
        workerInfo.workerType = reqBody.workerType;
        workerInfo.credentialType = reqBody.credentialType;
        workerInfo.credentialNo = reqBody.credentialNo;
        workerInfo.peopleName = reqBody.peopleName;
        workerInfo.gender = reqBody.gender;
        workerInfo.genderCode = reqBody.genderCode;
        workerInfo.nation = reqBody.nation;
        workerInfo.residenceDetailAddress = reqBody.residenceDetailAddress;
        workerInfo.phoneNo = reqBody.phoneNo;
        workerInfo.headPic = reqBody.headPic;
        workerInfo.idPic = reqBody.idPic;
        workerInfo.tel = reqBody.tel;
        workerInfo.position = reqBody.position;
        workerInfo.email = reqBody.email;
        workerInfo.livePic = reqBody.livePic;
        workerInfo.political_Code = reqBody.political_Code;
        workerInfo.isDeleted = 0;
        await workerDal.update(workerInfo);
        await prosterDal.byWorkerIDdelete(reqBody.workerID);
        if (reqBody.prosterList != null) {
            for (const item of reqBody.prosterList) {
                var prosterentity = new prosterEntity();
                prosterentity.rosterID = cFun.guid();
                prosterentity.villageID = reqBody.villageID;
                prosterentity.workerID = reqBody.workerID;
                prosterentity.workWeek = item.workWeek;
                prosterentity.workStartTime = item.workStartTime;
                prosterentity.workEndTime = item.workEndTime;
                prosterentity.rosterStartTime = item.rosterStartTime;
                prosterentity.rosterEndTime = item.rosterEndTime;
                await prosterDal.insert(prosterentity);
            }
        }
    } else {
        let workerInfos = new WorkerEntity();
        workerInfos.workerID = cFun.guid();
        workerInfos.streetID = reqBody.streetID;
        workerInfos.committeeID = reqBody.committeeID;
        workerInfos.villageID = reqBody.villageID;
        workerInfos.workerType = reqBody.workerType;
        workerInfos.credentialType = reqBody.credentialType;
        workerInfos.credentialNo = reqBody.credentialNo;
        workerInfos.peopleName = reqBody.peopleName;
        workerInfos.gender = reqBody.gender;
        workerInfos.genderCode = reqBody.genderCode;
        workerInfos.nation = reqBody.nation;
        workerInfos.residenceDetailAddress = reqBody.residenceDetailAddress;
        workerInfos.phoneNo = reqBody.phoneNo;
        workerInfos.tel = reqBody.tel;
        workerInfos.position = reqBody.position;
        workerInfos.email = reqBody.email;
        workerInfos.headPic = reqBody.headPic;
        workerInfos.idPic = reqBody.idPic;
        workerInfos.livePic = reqBody.livePic;
        workerInfos.political_Code = reqBody.political_Code;
        workerInfos.isDeleted = 0;
        await workerDal.insert(workerInfos);
        if (reqBody.prosterList != null) {
            for (const item of reqBody.prosterList) {
                var prosterentity = new prosterEntity();
                prosterentity.rosterID = cFun.guid();
                prosterentity.villageID = reqBody.villageID;
                prosterentity.workerID = workerInfos.workerID;
                prosterentity.workWeek = item.workWeek;
                prosterentity.workStartTime = item.workStartTime;
                prosterentity.workEndTime = item.workEndTime;
                prosterentity.rosterStartTime = item.rosterStartTime;
                prosterentity.rosterEndTime = item.rosterEndTime;
                await prosterDal.insert(prosterentity);
            }
        }
    }
   
   
    return res.json(cFun.responseStatus(0, 'success'));
}); 
module.exports.updateAddWorker = updateAddWorker;
var delsWorker = cFun.awaitHandlerFactory(async (req, res, next) => { //删除工作人员
    var reqBody = req.body;
    if (!reqBody.workerIDs)
        return res.json(cFun.responseStatus(-1, '参数有误'));
    for (const item of reqBody.workerIDs) {
        await workerDal.byWorkerIDdelete(item);
        await prosterDal.byWorkerIDdelete(item);
    }
    return res.json(cFun.responseStatus(0, 'success'));
});
module.exports.delsWorker = delsWorker;