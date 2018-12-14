const cFun = require('../utils/commonFunc');
const deviceOpsLogDal = require('../dals/e_device_ops_logDal')

var getDeviceOpsList = cFun.awaitHandlerFactory(async (req, res, next) => {
    var reqBody = req.body;

    var deviceOpsLogs = await deviceOpsLogDal.getByDeviceID(reqBody.deviceID);
    if (deviceOpsLogs == null || deviceOpsLogs.length == 0) {
        return  res.json(cFun.responseStatus(0,'该设备无运维数据'));
    }

    var resDeviceOpsList=[];
    for (let i = 0; i < deviceOpsLogs.length; i++) {
        let deviceOpsLog = deviceOpsLogs[i];
        
        resDeviceOpsList.push({
            opsID:deviceOpsLog.opsID,
            opsType:deviceOpsLog.opsType,
            opsTypeName:deviceOpsLog.opsTypeName,
            opsCount:deviceOpsLog.opsCount,
            alarmTime:deviceOpsLog.alarmTime
        }); 
    }

    var resBody={
        deviceOpsList:resDeviceOpsList
    }
    
    return  res.json(cFun.responseStatus(0,'success',resBody));
});
module.exports.getDeviceOpsList=getDeviceOpsList;