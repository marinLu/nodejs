const token = require('./token');
const userToken = require('../dals/s_userTokenDal');
const cFun = require('../utils/commonFunc');
const userExtendDal = require('../dals/s_user_extendDal');
const UserExtendEntity = require('../entitys/s_user_extendEntity');
const traceDal = require('../dals/p_traceDal');
const TraceEntity = require('../entitys/p_traceEntity');

module.exports = async function authorize(req, res, next) {

    if (req == null || req.body == null) {
        return res.json(cFun.responseStatus(-1, '非法请求'));
    }

    //user 路由过滤
    if (/^\/api\/user/.test(req.path)) {
        return next();
    }

    if (cFun.headEmpty(req.body.head)) {
        return res.json(cFun.responseStatus(-1, '非法请求'));
    }

    var userID = await isLogin(req.body.head);
    if (userID == -1 || userID == -2) {
        return res.json(cFun.responseStatus(userID, '请重新登录'));
    }

    // if (!cFun.isNullOrEmpty(req.body.head.longitude) &&
    //     !cFun.isNullOrEmpty(req.body.head.latitude) &&
    //     req.body.head.platform != 'showroom') {

    //     var userTrace = new TraceEntity();
    //     userTrace.traceID = cFun.guid();
    //     userTrace.pID = userID;
    //     userTrace.pIDType = 0;
    //     userTrace.source = 0;
    //     userTrace.longitude = req.body.head.longitude;
    //     userTrace.latitude = req.body.head.latitude;
    //     userTrace.locationTime = cFun.formatDateTime();

    //     traceDal.insert(userTrace);

    //     var userExtendInfo = await userExtendDal.getByUserID(userID);
    //     if (userExtendInfo != null) {
    //         userExtendDal.updateLocation(req.body.head.longitude, req.body.head.latitude, userID);
    //     } else {
    //         var userExtendEntity = new UserExtendEntity();
    //         userExtendEntity.userID = userID;
    //         userExtendEntity.longitude = req.body.head.longitude;
    //         userExtendEntity.latitude = req.body.head.latitude;
    //         userExtendDal.insert(userExtendEntity);
    //     }
    // }

    req.body.head.userID = userID;
    next();
}

/**
 * 登录成功=返回userID
 * 登录失效=返回-2
 * 登录失败=返回-1
 * @param {*} head 
 */
async function isLogin(head) {
    if (head == null) {
        return -1;
    }

    if (head.platform == 'showroom') {
        return 1;
    }

    if (head.token == null || head.token == "") {
        return -1;
    }

    var authEntity = token.validate(head.token);
    if (authEntity == null) {
        return -1;
    }

    var resultCode = token.loginVerify(authEntity, head.platform);
    if (resultCode == -1 || resultCode == -2) {
        return resultCode;
    }

    var tokenInfo = await userToken.getByID(authEntity.tokenID);
    if (tokenInfo == null || tokenInfo.authToken == null ||
        tokenInfo.authToken == "" ||
        tokenInfo.authToken != head.token) {
        return -2;
    }

    return tokenInfo.userID;
}