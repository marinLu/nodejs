module.exports = class e_alarm_logEntity {
    constructor(alarmID, deviceID, deviceType,
        alarmType, alarmTypeName, optionID,
        villageID, alarmLevel, alarmLevelName,
        alarmCount, alarmContent, alarmState,
        isDeal, processedContent, processedTime,
        processDeadline, longitude, latitude,
        alarmTime, insertTime, updateTime, flowLog) {
        this.alarmID = alarmID;
        this.deviceID = deviceID;
        this.deviceType = deviceType;
        this.alarmType = alarmType;
        this.alarmTypeName = alarmTypeName;
        this.optionID = optionID;
        this.villageID = villageID;
        this.alarmLevel = alarmLevel;
        this.alarmLevelName = alarmLevelName;
        this.alarmCount = alarmCount;
        this.alarmContent = alarmContent;
        this.alarmState = alarmState;
        this.isDeal = isDeal;
        this.processedContent = processedContent;
        this.processedTime = processedTime;
        this.processDeadline = processDeadline;
        this.longitude = longitude;
        this.latitude = latitude;
        this.alarmTime = alarmTime;
        this.insertTime = insertTime;
        this.updateTime = updateTime;
        this.flowLog = flowLog;
    }
}