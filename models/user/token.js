const crypto = require('crypto-js');
const commonFunc = require('../utils/commonFunc')

var key = "MZ7^5f$bjRP#mL$Q";
var value = "*JyxSM^Svfzp7wd&";

/**
 * 生成token 返回token
 * @param {*} tokenID 
 * @param {*} timestamp 
 * @param {*} platform 
 */
var generate = function (tokenID, timestamp, platform) {
    try {
        var cryptoString = tokenID + " " + timestamp + " " + platform;

        return crypto.AES.encrypt(cryptoString,
            crypto.enc.Utf8.parse(key), {
                iv: crypto.enc.Utf8.parse(value),
                mode: crypto.mode.CBC,
                padding: crypto.pad.Pkcs7
            }).ciphertext.toString();
    } catch (error) {
        return null;
    }

}
module.exports.generate=generate;

/**
 * 验证auth，返回登录实体
 * @param {*} auth 凭证
 */
var validate = function (auth) {
    try {
        var encryptedHexStr = crypto.enc.Hex.parse(auth);
        var encryptedBase64Str = crypto.enc.Base64.stringify(encryptedHexStr);
        var decryptString = crypto.AES.decrypt(encryptedBase64Str,
            crypto.enc.Utf8.parse(key), {
                iv: crypto.enc.Utf8.parse(value),
                mode: crypto.mode.CBC,
                padding: crypto.pad.Pkcs7
            }).toString(crypto.enc.Utf8);
        var paramArray = decryptString.split(" ");
        if (paramArray.length != 3) { //解密失败
            return null;
        }

        return {
            tokenID: paramArray[0],
            expireTime: paramArray[1],
            platform: paramArray[2]
        }
    } catch (error) {
        return null;
    }
}

module.exports.validate = validate



/**
 * 登录验证
 * @param {登录实体} authEntity 
 * @param {String} questPlatform 
 */
var loginVerify = function (authEntity, questPlatform) {

    //校验合法性
    if (typeof authEntity.tokenID != 'string' ||
        typeof authEntity.expireTime != 'string' ||
        authEntity.platform != 'app' &&
        authEntity.platform != 'web') {
        return -1;
    }

    //过期
    if (authEntity.expireTime < commonFunc.timestamp()) {
        return -2;
    }

    //登录平台校验
    if (authEntity.platform != questPlatform) {
        return -1;
    }

    return authEntity.tokenID;
}

module.exports.loginVerify = loginVerify

/**
 * 生成登录事件戳
 * @param {*} platform 
 */
var generateLoginTimestamp = function (platform) {
    var now = new Date();

    //app token 有效期7天
    if (platform == 'app') {
        return commonFunc.timestamp(new Date(now.getTime() + 7 * 24 * 3600 * 1000))
    }

    //web token 有效期30天
    return commonFunc.timestamp(new Date(now.getTime() + 30 * 24 * 3600 * 1000))

}
module.exports.generateLoginTimestamp = generateLoginTimestamp;

/**
 * userID 加密
 * @param {*} userID 
 */
var encryptUserID = function (userID) {
    var key = "B#lnG$YHAPjAXifx";
    var value = "Q1$bqiJnA%&2nlh*";
    try {
        return crypto.AES.encrypt(userID,
            crypto.enc.Utf8.parse(key), {
                iv: crypto.enc.Utf8.parse(value),
                mode: crypto.mode.CBC,
                padding: crypto.pad.Pkcs7
            }).ciphertext.toString();
    } catch (err) {
        return null;
    }

    return null;
}
module.exports.encryptUserID = encryptUserID;

/**
 * userID 解密
 * @param {*} userID 
 */
var decryptUserID = function (userID) {
    var key = "B#lnG$YHAPjAXifx";
    var value = "Q1$bqiJnA%&2nlh*";

    try {
        var encryptedHexStr = crypto.enc.Hex.parse(userID);
        var encryptedBase64Str = crypto.enc.Base64.stringify(encryptedHexStr);
        return crypto.AES.decrypt(encryptedBase64Str,
            crypto.enc.Utf8.parse(key), {
                iv: crypto.enc.Utf8.parse(value),
                mode: crypto.mode.CBC,
                padding: crypto.pad.Pkcs7
            }).toString(crypto.enc.Utf8);

    } catch (error) {
        return null;
    }

    return null;
}
module.exports.decryptUserID = decryptUserID;

// console.log(generate('863e9870ab5111e89ae92b807687c94a',1535524849,'web'))