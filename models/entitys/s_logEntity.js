module.exports = class s_logEntity {
    constructor(logID, logType, operationType, logContent, systemCode, moduleCode, functionCode, logIP, userID, insertTime, updateTime) {
        this.logID = logID;
        this.logType = logType;
        this.operationType = operationType;
        this.logContent = logContent;
        this.systemCode = systemCode;
        this.moduleCode = moduleCode;
        this.functionCode = functionCode;
        this.logIP = logIP;
        this.userID = userID;
        this.insertTime = insertTime;
        this.updateTime = updateTime;
    }
}