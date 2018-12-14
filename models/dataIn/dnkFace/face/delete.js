const cFun = require("../../../utils/commonFunc");
const middleServerDal = require(".././../../dals/f_middle_serverDal");
const faceGWDal = require("../../../dals/f_face_gatewayDal");
// const faceDownLogDal = require("../../../dals/f_face_downLog");
const peopleHouseDal = require("../../../dals/p_people_houseDal");
const sendRequest = require("../../../utils/sendRequest");

/**
 * 接口接收参数：
 *  req.Body = {
 *      peopleID,picURL,buildingIDAndDownLog:[{buildingID,DownLogID}]
 *  }
 */
var deleteFace = cFun.awaitHandlerFactory(async (req, res, next) => {
    var reqBody = req.body;

    var buildingIDAndDownLog = reqBody.buildingIDAndDownLog;

    res.json(cFun.responseStatus(0, "success"));

    for (const item of buildingIDAndDownLog) {

        var faceGW = await faceGWDal.getByBuildingID(item.buildingID);
        if (!faceGW) {
            return;
        }

        var middleServer = await middleServerDal.getByID(faceGWs.middleServerID);
        if (!middleServer) {
            return;
        }

        var sendBody = {
            faceID: reqBody.faceID,
            channels: [{
                ip: faceGW.ip,
                port: faceGW.port
            }]
        }

        var returenResponse = await sendRequest.requestAPI("POST", middleServer.ip, middleServer.port, "/face/Delete", sendBody);
        // var faceDownLog = await faceDownLogDal.getByDownLogID(item.downLogID);

        if (returenResponse == -1 || (returenResponse.responseStatus && returenResponse.responseStatus.resultCode != 200)) {  //人脸特征值删除时失败

            // faceDownLog.status = 4;
            // faceDownLogDal.insert(faceDownLog);

        } else if (returenResponse.responseStatus.resultCode == 200) {     //人脸特征值删除成功

            // faceDownLog.status = 3;
            // faceDownLogDal.insert(faceDownLog);

            var peopleHouses = await peopleHouseDal.getByBuildingID(item.buildingID);
            for (const itemHouse of peopleHouses) {
                itemHouse.isDelete = 1;
                peopleHouseDal.update(itemHouse);
            }

        } else {        //可能基于网络状况，下发失败。或者长时间未响应的padding状态
            // faceDownLog.status = 0;
            // faceDownLogDal.insert(faceDownLog);
        }
    }

});
module.exports.deleteFace = deleteFace;