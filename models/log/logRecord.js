var cFun = require('../utils/commonFunc');
var logDal = require('../dals/s_logDal');
var LogEntity = require('../entitys/s_logEntity');

/**
 * 记录正常信息
 * @param {any} msg
 */
function info(moduleCode, functionCode, msg) {
    writeInDB(moduleCode, functionCode, msg, 'info');
}

/**
 * 记录错误信息
 * @param {any} msg
 * @param {any} error
 */
function error(moduleCode, functionCode, msg) {
    writeInDB(moduleCode, functionCode, msg, 'error');
}
/**
 * 记录警告信息
 * @param {any} msg
 * @param {any} warn
 */
function warning(moduleCode, functionCode, msg) {
    writeInDB(moduleCode, functionCode, msg, 'warn');
}
/**
 * 写入数据库
 * @param {any} msg
 * @param {any} type
 */
function writeInDB(moduleCode, functionCode, msg, type) {
    var log = new LogEntity();
    log.logID = cFun.guid();
    log.logContent = msg;
    log.logType = type;
    log.functionCode = functionCode;
    log.systemCode = 'bluePlusService';
    log.moduleCode = moduleCode;

    logDal.insert(log);
}

module.exports = {
    info: info,
    error: error,
    warning: warning
};