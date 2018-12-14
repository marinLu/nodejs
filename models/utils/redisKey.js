const crypto = require('crypto-js');

/**
 * 用户权限 小区信息
 * @param {*} userID 
 */
module.exports.userAuthorityVillageInfos = function (userID) {
    return crypto.MD5(userID + '_authorityVillageInfos').toString();
}

/**
 * 用户权限 功能信息
 * @param {*} userID 
 */
module.exports.userAuthorityFunctions = function (userID) {
    return crypto.MD5(userID + '_authorityFunctions').toString();
}

/**
 * 小区登记车辆
 * @param {*} parkingID 
 */
module.exports.parkRegisterCars = function (parkingID) {
    return crypto.MD5(parkingID + '_registerCars').toString();
}

/**
 * getByPath统计
 * @param {*} path 
 * @param {*} villageID 
 */
module.exports.getByPath = function (path, villageID) {
    return crypto.MD5(path + '_' + villageID + '_getByPath').toString();
}



module.exports.userInfo = function (userID) {
    return crypto.MD5(userID + '_userInfo').toString();
}

module.exports.peopleInfo = function (peopleID) {
    return crypto.MD5(peopleID + '_peopleInfo').toString();
}

module.exports.peopleHouseInfo = function (peopleID) {
    return crypto.MD5(peopleID + '_peopleHouseInfo').toString();
}

module.exports.parkingInfo = function (parkingID) {
    return crypto.MD5(parkingID + '_parkingInfo').toString();
}

module.exports.parkingInfo = function (parkingID) {
    return crypto.MD5(parkingID + '_parkingInfo').toString();
}

module.exports.peopleTags = function (peopleID) {
    return crypto.MD5(peopleID + '_peopleTags').toString();
}

module.exports.dictionary = function (path) {
    return crypto.MD5(path + '_dictionary').toString();
}