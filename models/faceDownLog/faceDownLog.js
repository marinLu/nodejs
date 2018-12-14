// const faceDownLogDal = require('../dals/f_face_downLog');
// const cFun = require('../utils/commonFunc');
// const faceGatewayDal = require('../dals/f_face_gatewayDal');
// const redis = require('../utils/redis');
// const redisKey = require('../utils/redisKey');
// const verifyAuthority = require('../authority/verifyAuthority');
// const faceDownLogEntity = require('../entitys/f_face_downLog');
// var bluerequest = require('request');
// var insertFacedownLog = cFun.awaitHandlerFactory(async (req, res, next) => {//下发，批量下发
//     var reqBody = req.body;
//     var buildingIDAndDownLog = [];
//     for (const item of reqBody.faceDownLogList) {
//         var faceGatewayInfo = faceGatewayDal.getByBuildingID(item.BuildingID);
//         if (faceGatewayInfo == null)
//             return res.json(cFun.responseStatus(-1, '设备不存在'));
//         var faceDownLog = new faceDownLogEntity();
//         faceDownLog.downLogID = cFun.guid();
//         faceDownLog.faceGWID = faceGatewayInfo.faceGWID;
//         faceDownLog.peopleID = item.peopleID;
//         buildingIDAndDownLog.push({ buildingID: item.buildingID, downLogID: faceDownLog.downLogID})
//         faceDownLogDal.insert(faceDownLog);
//     }
//     var obj={buildingIDAndDownLog:buildingIDAndDownLog,peopleID: item.peopleID, headPicName:item.headPicName}
//     bluerequest({
//         url: "http://" + config().host.hostName + ":" + config().host.port + "/api/datain/dnk/face/addormodify",
//         method: "POST",
//         json: true,
//         headers: {
//             "content_type": "application/json"
//         },
//         body: obj
//     }, function (error, response, body) {
//         if (!error) {
//             console.log("发送给蓝加平台成功");
//         }
//     })


    
      
// return res.json(cFun.responseStatus(0, 'success'));

// });
// module.exports.insertFacedownLog = insertFacedownLog;