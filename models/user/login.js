const token = require('./token');
const cFun = require('../utils/commonFunc');
const userDal = require('../dals/s_userDal');
const tokenDal = require('../dals/s_userTokenDal');
const UserEntity = require('../entitys/s_userEntity');
const TokenEntity = require('../entitys/s_userTokenEntity');
const UserRoleEntity = require('../entitys/s_user_roleEntity');
const crypto = require('crypto-js');
const redis = require('blueplus-redis');
const redisKey = require('../utils/redisKey');

/**
 * 登录
 */
var login =
    cFun.awaitHandlerFactory(async (req, res, next) => {
        if (req == null || req.body == null ||
            req.body.userName == null || req.body.userName == "" ||
            req.body.password == null || req.body.password == "") {
            return res.json(cFun.responseStatus(-1, '非法请求'));
        }
        req.body.password = crypto.MD5(req.body.password).toString();

        var userInfo = await userDal.query(
            "select * from s_user where loginName=:loginName and password=:password limit 1", {
                loginName: req.body.userName,
                password: req.body.password
            }
        );

        if (userInfo == null || userInfo.length == 0) {
            return res.json(cFun.responseStatus(-1, '用户名或密码错误'));
        }

        var userEntity = JSON.parse(JSON.stringify(userInfo))[0];

        var loginSystemType = 0; //登录方式
        if (req.body.head.platform == 'app') {
            loginSystemType = 1;
        }

        //状态校验
        if (userEntity.status == 1) {
            return res.json(cFun.responseStatus(-1, '该账号已经被禁用'));
        }

        if (userEntity.isValid == 1) {
            return res.json(cFun.responseStatus(-1, '该账号无效'));
        }

        //登录方式校验
        if (userEntity.loginSystemType != 3 &&
            userEntity.loginSystemType != loginSystemType) {
            return res.json(cFun.responseStatus(-1, '该用户不支持在该终端登录'));
        }

        //登录网段校验
        if (!cFun.checkIp(userEntity.accessNet, cFun.getClientIp(req))) {
            return res.json(cFun.responseStatus(-1, '不支持该网段登录'));
        }

        var tokenID = cFun.guid();
        if (userEntity.multLogin == 0) {
            //单点登录
            var tokenInfo = await tokenDal.getByUserIDType(userEntity.userID, loginSystemType, 0);
            if (tokenInfo != null) {
                tokenID = tokenInfo.userTokenID;
            }
        }

        //生成token
        var authToken = token.generate(tokenID,
            token.generateLoginTimestamp(req.body.head.platform),
            req.body.head.platform);
        if (authToken == null || authToken == "") {
            return res.json(cFun.responseStatus(-1, '登录异常'));
        }

        if (tokenInfo == null) {
            //多点登录 或单点登录 第一次登录
            var tokenEntity = new TokenEntity();
            tokenEntity.userTokenID = tokenID;
            tokenEntity.userID = userEntity.userID;
            tokenEntity.authToken = authToken;
            tokenEntity.loginSystemType = loginSystemType;
            tokenEntity.loginType = 0;
            tokenEntity.lastLoginIP = cFun.getClientIp(req);
            tokenEntity.lastLoginTime = cFun.formatDateTime(new Date());
            tokenDal.insert(tokenEntity);
        } else {
            tokenInfo.authToken = authToken;
            tokenInfo.loginSystemType = loginSystemType;
            tokenInfo.lastLoginIP = cFun.getClientIp(req);
            tokenInfo.lastLoginTime = cFun.formatDateTime(new Date());
            tokenDal.update(tokenInfo);
        }

        var resBody = {
            token: authToken
        };
        return res.json(cFun.responseStatus(0, 'success', resBody))
    });

module.exports.login = login;

/**
 * 登出
 */
var loginout =
    cFun.awaitHandlerFactory(async (req, res, next) => {

        if (req == null || req.body == null ||
            cFun.headEmpty(req.body.head)) {
            return res.json(cFun.responseStatus(-1, '非法请求'));
        }

        var loginInfo = token.validate(req.body.head.token);
        if (loginInfo == null || loginInfo.platform != req.body.head.platform) {
            return res.json(cFun.responseStatus(-1, 'token无效'));
        }

        var verifyCode = token.loginVerify(loginInfo, req.body.head.platform);
        if (verifyCode == -1) {
            return res.json(cFun.responseStatus(-1, 'token无效'));
        }
        if (verifyCode == -2) {
            return res.json(cFun.responseStatus(0, 'success'));
        }

        var tokenInfo = await tokenDal.getByID(loginInfo.tokenID);
        tokenInfo.authToken = "";
        tokenInfo.activeTime = cFun.timestamp(new Date()) - cFun.timestamp(tokenInfo.lastLoginTime);

        tokenDal.update(tokenInfo);

        var userAuthorityVillageInfoKey = redisKey.userAuthorityVillageInfos(tokenInfo.userID);
        redis.del(userAuthorityVillageInfoKey);

        var userAuthorityFunctionsKey = redisKey.userAuthorityFunctions(tokenInfo.userID);
        redis.del(userAuthorityFunctionsKey);

        return res.json(cFun.responseStatus(0, 'success'));
    });
module.exports.loginout = loginout;

/**
 * 保活
 */
var keepAlive =
    cFun.awaitHandlerFactory(async (req, res, next) => {
        try {
            if (req == null || req.body == null ||
                cFun.headEmpty(req.body.head)) {
                return res.json(cFun.responseStatus(-1, '非法请求'));
            }

            var loginInfo = token.validate(req.body.head.token);
            if (loginInfo == null || loginInfo.platform != req.body.head.platform) {
                return res.json(cFun.responseStatus(-1, 'token无效'));
            }

            var tokenInfo = await tokenDal.getByID(loginInfo.tokenID);
            if (tokenInfo == null || tokenInfo.authToken == null ||
                tokenInfo.authToken == '' ||
                tokenInfo.authToken != req.body.head.token) {
                return res.json(cFun.responseStatus(-1, '登录失效请重新登录'));
            }

            tokenInfo.authToken = token.generate(tokenInfo.userTokenID,
                token.generateLoginTimestamp(req.body.head.platform),
                req.body.head.platform);

            tokenInfo.activeTime = cFun.timestamp(new Date()) - cFun.timestamp(tokenInfo.lastLoginTime);
            tokenDal.update(tokenInfo);

            var resBody = {
                token: tokenInfo.authToken
            };
            return res.json(
                cFun.mergeJson(cFun.responseStatus(0, 'success'), resBody)
            );

        } catch (error) {
            return res.json(cFun.responseStatus(-1, 'exception'));
        }

    });
module.exports.keepAlive = keepAlive;