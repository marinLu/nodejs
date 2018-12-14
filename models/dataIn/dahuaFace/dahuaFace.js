const cFun = require("../../utils/commonFunc");
const dahuaConfig = require("../../../config/dahuaConfig");
const crypto = require('crypto-js');
const sendRequest = require("../../utils/sendRequest")
const config = require("../../config");
const util = require("util");

var login = cFun.awaitHandlerFactory(async (req, res, next) => {
    
    var reqBody = req.body;

    var name = reqBody.name;
    var password = crypto.MD5(reqBody.password).toString();

    var sendBody = {
        name : name,
        password : password
    }

    var responseData = await sendRequest.requestAPI("POST" , dahuaConfig().host , dahuaConfig().login.port , dahuaConfig().login.url , sendBody);

    if(responseData == -1){
        return res.json(cFun.responseStatus(-1 , "请求大华接口失败"));
    }

    var headers = {
        'Content-Type':'application/JSON', 
        'Cookie':'session_id='+responseData.session_id
    }

    var sendBody = {
        target_url :"http://"+ config().host.hostName +":"+ config().host.port + "/api/datain/dahuaFace/dahuaCallback"
    }

    var responseData = await sendRequest.requestAPI("POST" , dahuaConfig().host , dahuaConfig().notify.port , dahuaConfig().notify.url , sendBody , headers);
    if(responseData == -1){
        return res.json(cFun.responseStatus(-1 , "注册订阅回调接口失败"));
    }

    return res.json(cFun.responseStatus(0, 'success'));
});
module.exports.login = login;