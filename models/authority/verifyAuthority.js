

/**
 * 看到全部用户姓名的权限
 * @param {*} functions 
 */
module.exports.viewPeopleName = function (functions) {
    return _.findIndex(functions, x => x.functionCode == 'mask_peopleName') >= 0;
}

/**
 * 看到全部用户手机号的权限
 * @param {*} functions 
 */
module.exports.viewMobile = function (functions) {
    return _.findIndex(functions, x => x.functionCode == 'mask_mobile') >= 0;
}

/**
 * 看到全部用户证件号的权限
 * @param {*} functions 
 */
module.exports.viewCredentialNo = function (functions) {
    return _.findIndex(functions, x => x.functionCode == 'mask_credentialNo') >= 0;
}

/**
 * 用户头像掩码
 * @param {*} functions 
 */
module.exports.viewHeadPic = function (functions) {
    return _.findIndex(functions, x => x.functionCode == 'mask_headPic') >= 0;
}