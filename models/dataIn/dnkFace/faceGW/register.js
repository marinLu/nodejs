const cFun = require("../../../utils/commonFunc");

var register = cFun.awaitHandlerFactory(async (req, res, next) => {
    
    var reqBody = req.body;

    // deviceIp , deviceMac , deviceTime , middleServerIP
    if(!reqBody.deviceIp || !reqBody.deviceMac){
        return res.json(cFun.responseStatus(-1 , "缺少人脸网关IP或MAC"));
    }

    if(!reqBody.middleServerIP){
        return res.json(cFun.responseStatus(-2 , "缺少人脸网关的IP"))
    }

    /**
     * 如何注册人脸网关？
     */

    return res.json(cFun.responseStatus(0 , "success"));

});
module.exports.register = register;