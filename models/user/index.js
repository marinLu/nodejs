var express = require('express');
var router = express.Router();
module.exports = router;

const login = require('./login');
/**
 * 登录
 */
router.post("/login", login.login);

/**
 * 登出
 */
router.post("/loginout", login.loginout);

/**
 * 保活
 */
router.post("/keepAlive", login.keepAlive);


const user = require('./user');

/**
 * 获取用户信息
 */
router.post("/getUserInfo", user.getUserInfo);

/**
 * 获取所有用户信息
 */
router.post("/getAllUserInfos", user.getAllUserInfos);

/**
 * 新增用户信息
 */
router.post("/add", user.add);

/**
 * 更新用户信息
 */
router.post("/update", user.update);

/**
 * 删除用户信息
 */
router.post("/delete", user.deleteUser);

/**
 * 获取用户数量
 */
router.post("/getUserCount", user.getUserCount);
/**
 * 修改密码
 */
router.post("/updateUserPassWord", user.updateUserPassWord);

/**
 * 重置密码
 */
router.post("/resetUserPassWord", user.resetUserPassWord);
