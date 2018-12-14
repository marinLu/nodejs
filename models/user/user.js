const token = require('./token');
const cFun = require('../utils/commonFunc');
const userDal = require('../dals/s_userDal');
const tokenDal = require('../dals/s_userTokenDal');
const UserEntity = require('../entitys/s_userEntity');
const TokenEntity = require('../entitys/s_userTokenEntity');
const UserRoleEntity = require('../entitys/s_user_roleEntity');
const crypto = require('crypto-js');
const departmentDal = require('../dals/s_departmentDal');
const userRoleDal = require('../dals/s_user_roleDal');
const authorityDal = require("../dals/s_authorityDal");
const authorityEntity = require("../entitys/s_authorityEntity");
let mima = "111111";
/**
 * 获取用户信息
 */
var getUserInfo =
    cFun.awaitHandlerFactory(async (req, res, next) => {

        if (req == null || req.body == null ||
            cFun.headEmpty(req.body.head)) {
            return res.json(cFun.responseStatus(-1, '非法请求'));
        }

        var loginInfo = token.validate(req.body.head.token);
        if (loginInfo == null) {
            return res.json(cFun.responseStatus(-1, 'token无效'));
        }

        var verifyCode = token.loginVerify(loginInfo, req.body.head.platform)
        if (verifyCode == -1) {
            return res.json(cFun.responseStatus(-1, 'token无效'));
        }
        if (verifyCode == -2) {
            return res.json(cFun.responseStatus(-2, '登录失效请重新登录'));
        }

        var tokenInfo = await tokenDal.getByID(loginInfo.tokenID);
        if (tokenInfo == null || tokenInfo.authToken == null || tokenInfo.authToken == '') {
            return res.json(cFun.responseStatus(-2, '登录失效请重新登录'));
        }

        var userInfo = await userDal.getByID(tokenInfo.userID);
        if (userInfo == null) {
            return res.json(cFun.responseStatus(0, '不存在当前用户'));
        }

        var resBody = {
            userInfo: {
                userID: token.encryptUserID(userInfo.userID),
                displayName: userInfo.displayName,
                phoneTel: userInfo.phoneTel,
                status: userInfo.status,
                email: userInfo.email,
                insertTime: userInfo.insertTime,
            }
        };
        return res.json(
            cFun.mergeJson(cFun.responseStatus(0, 'success'), resBody)
        );
    });
module.exports.getUserInfo = getUserInfo;

/**
 * 获取所有用户信息
 */
var getAllUserInfos =
    cFun.awaitHandlerFactory(async (req, res, next) => {

        if (req == null || req.body == null ||
            cFun.headEmpty(req.body.head)) {
            return res.json(cFun.responseStatus(-1, '非法请求'));
        }

        var loginInfo = token.validate(req.body.head.token);
        if (loginInfo == null) {
            return res.json(cFun.responseStatus(-1, 'token无效'));
        }

        var verifyCode = token.loginVerify(loginInfo, req.body.head.platform)
        if (verifyCode == -1) {
            return res.json(cFun.responseStatus(-1, 'token无效'));
        }
        if (verifyCode == -2) {
            return res.json(cFun.responseStatus(0, '登录失效请重新登录'));
        }


        var userAllInfos = [];
        if (Number(req.body.pageNum) >= 1 && Number(req.body.pageSize) > 0) {
            userAllInfos = await userDal.getByPage(Number(req.body.pageNum), Number(req.body.pageSize), req.body.orderRule);
        } else {
            userAllInfos = await userDal.getAll();
        }
        let count = await userDal.getAll();
        if (userAllInfos == null || userAllInfos.length == 0) {
            return res.json(cFun.responseStatus(0, '不存在当前用户',{count:count}));
        }

        var allUserRoles = await userRoleDal.getUserRoleByUserIDs(_.map(userAllInfos, x => x.userID));

        var resUserInfos = [];
        for (let i = 0; i < userAllInfos.length; i++) {
            let userInfo = userAllInfos[i];
            let userRoles = _.filter(allUserRoles, x => x.userID == userInfo.userID);
            var areaAuthoritys = [];
            var areaInfos = await authorityDal.getByUrIDAll(userInfo.userID); //根据角色ID获取区域
            for (let i = 0; i < areaInfos.length; i++) {
                areaAuthoritys.push({
                    areaCodes: areaInfos[i].areaCode,
                    areaNames: areaInfos[i].areaName
                })
            }
            let resUserRoles = [];
            for (let i = 0; i < userRoles.length; i++) {
                if (_.findIndex(resUserRoles, x => x.roleID == userRoles[i].roleID) < 0) {
                    resUserRoles.push({
                        roleID: userRoles[i].roleID,
                        roleName: userRoles[i].roleName
                    })
                }
            }

            resUserInfos.push({
                userID: token.encryptUserID(userInfo.userID),
                phoneTel: userInfo.phoneTel,
                displayName: userInfo.displayName,
                status: userInfo.status,
                email: userInfo.email,
                insertTime: userInfo.insertTime,
                loginName: userInfo.loginName,
                departmentName: userInfo.departmentName,
                departmentID: userInfo.departmentID,
                tel: userInfo.tel,
                position: userInfo.position,
                isValid: userInfo.isValid,
                multLogin: userInfo.multLogin,
                loginSystemType: userInfo.loginSystemType,
                accessNet: userInfo.accessNet,
                roles: resUserRoles,
                areaAuthoritys: areaAuthoritys

            });
        }
        var resBody = {
            userInfos: resUserInfos,
            count: count.length
        };

        return res.json(
            cFun.mergeJson(cFun.responseStatus(0, 'success'), resBody)
        );
    });
module.exports.getAllUserInfos = getAllUserInfos;

var getUserCount = cFun.awaitHandlerFactory(async (req, res, next) => {
    var reqBody = req.body;

    if (req == null || req.body == null ||
        cFun.headEmpty(req.body.head)) {
        return res.json(cFun.responseStatus(-1, '非法请求'));
    }

    var loginInfo = token.validate(req.body.head.token);
    if (loginInfo == null) {
        return res.json(cFun.responseStatus(-1, 'token无效'));
    }

    var verifyCode = token.loginVerify(loginInfo, req.body.head.platform)
    if (verifyCode == -1) {
        return res.json(cFun.responseStatus(-1, 'token无效'));
    }
    if (verifyCode == -2) {
        return res.json(cFun.responseStatus(0, '登录失效请重新登录'));
    }

    var userCount = await userDal.count();

    return res.json(cFun.responseStatus(0, 'success', {
        count: userCount
    }));
})
module.exports.getUserCount = getUserCount;

/**
 * 新增用户信息
 */
var add =
    cFun.awaitHandlerFactory(async (req, res, next) => {

        if (req == null || req.body == null || cFun.headEmpty(req.body.head)) {
            return res.json(cFun.responseStatus(-1, '非法请求'));
        }

        var loginInfo = token.validate(req.body.head.token);
        if (loginInfo == null) {
            return res.json(cFun.responseStatus(-1, 'token无效'));
        }
        if (req.body.roleIDs.length <= 0) {
            return res.json(cFun.responseStatus(-1, '角色ID非法参数！'));
        }
        var verifyCode = token.loginVerify(loginInfo, req.body.head.platform)
        if (verifyCode == -1) {
            return res.json(cFun.responseStatus(-1, 'token无效'));
        }
        if (verifyCode == -2) {
            return res.json(cFun.responseStatus(0, '登录失效请重新登录'));
        }

        var tokenInfo = await tokenDal.getByID(loginInfo.tokenID);
        if (tokenInfo == null || tokenInfo.authToken == null || tokenInfo.authToken == '') {
            return res.json(cFun.responseStatus(-2, '登录失效请重新登录'));
        }

        var userInfo = await userDal.getByLoginName(req.body.loginName);
        if (userInfo != null) {
            return res.json(cFun.responseStatus(-1, '登陆名已注册为用户'));
        }

        var userEntity = new UserEntity();
        userEntity.loginName = req.body.loginName;
        userEntity.phoneTel = req.body.phoneTel;
        userEntity.password = crypto.MD5(mima).toString();
        userEntity.displayName = req.body.displayName;
        userEntity.email = req.body.email;
        userEntity.userID = cFun.guid();
        userEntity.status = 0;
        userEntity.isValid = 0;
        userEntity.multLogin = 1;
        userEntity.departmentID = req.body.departmentID;
        userEntity.tel = req.body.tel;
        userEntity.position = req.body.position;
        userEntity.accessNet = req.body.accessNet;
        userEntity.loginSystemType = req.body.loginSystemType;
        var userRoles = [];
        for (const item of req.body.roleIDs) {
            let userRole = new UserRoleEntity();
            userRole.ID = cFun.guid();
            userRole.roleID = item;
            userRole.userID = userEntity.userID;
            userRoles.push(userRole);
        }
        if (req.body.areaCodeList) {
            for (const item2 of req.body.areaCodeList) {
                var authorityEntitys = new authorityEntity();
                authorityEntitys.authorityID = cFun.guid();
                authorityEntitys.urType = 0;
                authorityEntitys.urID = userEntity.userID;
                authorityEntitys.areaCode = item2.areaCode;
                authorityEntitys.areaName = item2.areaName;
                await authorityDal.insert(authorityEntitys);
            }
        }
        await userDal.insertUserInfo(userEntity, userRoles);

        return res.json(
            cFun.responseStatus(0, 'success')
        );
    });
module.exports.add = add;

/**
 * 更新用户信息
 */
var update =
    cFun.awaitHandlerFactory(async (req, res, next) => {
        if (req == null || req.body == null ||
            cFun.headEmpty(req.body.head)) {
            return res.json(cFun.responseStatus(-1, '非法请求'));
        }

        var loginInfo = token.validate(req.body.head.token);
        if (loginInfo == null) {
            return res.json(cFun.responseStatus(-1, 'token无效'));
        }

        var verifyCode = token.loginVerify(loginInfo, req.body.head.platform)
        if (verifyCode == -1) {
            return res.json(cFun.responseStatus(-1, 'token无效'));
        }
        if (verifyCode == -2) {
            return res.json(cFun.responseStatus(0, '登录失效请重新登录'));
        }

        var tokenInfo = await tokenDal.getByID(loginInfo.tokenID);
        if (tokenInfo == null || tokenInfo.authToken == null || tokenInfo.authToken == '') {
            return res.json(cFun.responseStatus(-2, '登录失效请重新登录'));
        }

        var userID = token.decryptUserID(req.body.userID);
        if (userID == null || userID == '') {
            return res.json(cFun.responseStatus(-1, '不存在修改用户'));

        }
        var userEntity = await userDal.getByID(userID);
        if (userEntity == null) {
            return res.json(cFun.responseStatus(-1, '不存在修改用户'));
        }
        if (req.body.roleIDs.length <= 0) {
            return res.json(cFun.responseStatus(-1, '角色ID非法参数！'));
        }
        userEntity.phoneTel = req.body.phoneTel;
        userEntity.loginName = req.body.loginName;
        userEntity.email = req.body.email;
        userEntity.displayName = req.body.displayName;
        userEntity.password = crypto.MD5(mima).toString();
        userEntity.departmentID = req.body.departmentID;
        userEntity.tel = req.body.tel;
        userEntity.status = req.body.status;
        userEntity.isValid = req.body.isValid;
        userEntity.position = req.body.position;
        userEntity.multLogin = req.body.multLogin;
        userEntity.loginSystemType = req.body.loginSystemType;
        userEntity.accessNet = req.body.accessNet;

        await userDal.update(userEntity);
        await userRoleDal.buUserIDdelete(userID);
        await authorityDal.querydels("DELETE from s_authority where urID ='" + userID + "' ");
        // var userRoles = [];
        for (const item of req.body.roleIDs) {
            let userRole = new UserRoleEntity();
            userRole.ID = cFun.guid();
            userRole.roleID = item;
            userRole.userID = userEntity.userID;
            await userRoleDal.insert(userRole);
        } if (req.body.areaCodeList) {
            for (const item2 of req.body.areaCodeList) {
                var authorityEntitys = new authorityEntity();
                authorityEntitys.authorityID = cFun.guid();
                authorityEntitys.urType = 0;
                authorityEntitys.urID = userEntity.userID;
                authorityEntitys.areaCode = item2.areaCode;
                authorityEntitys.areaName = item2.areaName;
                await authorityDal.insert(authorityEntitys);
            }
        }

        return res.json(cFun.responseStatus(0, 'success'));

    });

module.exports.update = update;

/**
 * 删除用户信息
 */
var deleteUser = cFun.awaitHandlerFactory(async (req, res, next) => {
    if (req == null || req.body == null ||
        req.body.userIDs == null ||
        cFun.headEmpty(req.body.head)) {
        return res.json(cFun.responseStatus(-1, '非法请求'));
    }

    var loginInfo = token.validate(req.body.head.token);
    if (loginInfo == null) {
        return res.json(cFun.responseStatus(-1, 'token无效'));
    }

    var verifyCode = token.loginVerify(loginInfo, req.body.head.platform)
    if (verifyCode == -1) {
        return res.json(cFun.responseStatus(-1, 'token无效'));
    }
    if (verifyCode == -2) {
        return res.json(cFun.responseStatus(-2, '登录失效请重新登录'));
    }

    var tokenInfo = await tokenDal.getByID(loginInfo.tokenID);
    if (tokenInfo == null || tokenInfo.authToken == null || tokenInfo.authToken == '') {
        return res.json(cFun.responseStatus(-2, '登录失效请重新登录'));
    }

    for (let i = 0; i < req.body.userIDs.length; i++) {
        var userID = token.decryptUserID(req.body.userIDs[i]);
        if (userID == null) {
            continue;
        }
        var result = await userDal.delete(userID);
    }
    await authorityDal.delRoles(userID);
    return res.json(cFun.responseStatus(0, 'success'));
});
module.exports.deleteUser = deleteUser;
/**
 * 用户修改密码
 */
var updateUserPassWord =
    cFun.awaitHandlerFactory(async (req, res, next) => {
        if (req == null || req.body == null ||
            cFun.headEmpty(req.body.head)) {
            return res.json(cFun.responseStatus(-1, '非法请求'));
        }

        var loginInfo = token.validate(req.body.head.token);
        if (loginInfo == null) {
            return res.json(cFun.responseStatus(-1, 'token无效'));
        }

        var verifyCode = token.loginVerify(loginInfo, req.body.head.platform)
        if (verifyCode == -1) {
            return res.json(cFun.responseStatus(-1, 'token无效'));
        }
        if (verifyCode == -2) {
            return res.json(cFun.responseStatus(0, '登录失效请重新登录'));
        }

        var tokenInfo = await tokenDal.getByID(loginInfo.tokenID);
        if (tokenInfo == null || tokenInfo.authToken == null || tokenInfo.authToken == '') {
            return res.json(cFun.responseStatus(-2, '登录失效请重新登录'));
        }

        var userID = token.decryptUserID(req.body.userID);
        if (userID == null || userID == '') {
            return res.json(cFun.responseStatus(-1, '不存在修改密码用户'));

        }
        var userEntity = await userDal.getByID(userID);
        if (userEntity == null) {
            return res.json(cFun.responseStatus(-1, '不存在修改密码用户'));
        }
        if (req.body.oldPassWord.length <= 0) {
            return res.json(cFun.responseStatus(-1, '旧密码非法参数！'));
        }
        if (req.body.newPassWord.length <= 0) {
            return res.json(cFun.responseStatus(-1, '新密码密码非法参数！'));
        }
        req.body.oldPassWord = crypto.MD5(req.body.oldPassWord).toString();

        var userInfo = await userDal.query(
            "select * from s_user where userID=:userID and password=:oldPassWord limit 1", {
                userID: userID,
                oldPassWord: req.body.oldPassWord
            }
        );
        if (userInfo == null || userInfo.length == 0) {
            return res.json(cFun.responseStatus(-1, '旧密码错误'));
        }
        userEntity.password = crypto.MD5(req.body.newPassWord).toString();
        await userDal.update(userEntity);
        return res.json(cFun.responseStatus(0, 'success'));

    });

module.exports.updateUserPassWord = updateUserPassWord;


/**
 * 重置密码
 */
var resetUserPassWord =
    cFun.awaitHandlerFactory(async (req, res, next) => {
        if (req == null || req.body == null ||
            cFun.headEmpty(req.body.head)) {
            return res.json(cFun.responseStatus(-1, '非法请求'));
        }

        var loginInfo = token.validate(req.body.head.token);
        if (loginInfo == null) {
            return res.json(cFun.responseStatus(-1, 'token无效'));
        }

        // var userEntity = await userDal.getByID(userID);
        // if (userEntity == null) {
        //     return res.json(cFun.responseStatus(-1, '不存在修改密码用户'));
        // }
        var verifyCode = token.loginVerify(loginInfo, req.body.head.platform)
        if (verifyCode == -1) {
            return res.json(cFun.responseStatus(-1, 'token无效'));
        }
        if (verifyCode == -2) {
            return res.json(cFun.responseStatus(0, '登录失效请重新登录'));
        }
        if (req.body.userIDs.length <= 0) {

            return res.json(cFun.responseStatus(-1, '参数非法'));
        }

        var tokenInfo = await tokenDal.getByID(loginInfo.tokenID);
        if (tokenInfo == null || tokenInfo.authToken == null || tokenInfo.authToken == '') {
            return res.json(cFun.responseStatus(-2, '登录失效请重新登录'));
        }

        for (const item of req.body.userIDs) {

            var userID = token.decryptUserID(item);
            if (userID) {
                let cz = "111111";
                var userEntity = await userDal.getByID(userID);
                if (userEntity) {
                    userEntity.password = crypto.MD5(cz).toString();
                    await userDal.update(userEntity);
                }
            }
        }
        return res.json(cFun.responseStatus(0, 'success'));

    });

module.exports.resetUserPassWord = resetUserPassWord;