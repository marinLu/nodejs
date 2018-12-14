module.exports = class e_device_alarm_logEntity {
    constructor(alarmID, deviceID, deviceType, alarmType, alarmTypeName, 
        alarmLevel, alarmLevelName, alarmCount, alarmState,
         isDeal,alarmTime, insertTime, updateTime) {
        this.alarmID = alarmID;
        this.deviceID = deviceID;
        this.deviceType = deviceType;
        this.alarmType = alarmType;
        this.alarmTypeName = alarmTypeName;
        this.alarmLevel = alarmLevel;
        this.alarmLevelName = alarmLevelName;
        this.alarmCount = alarmCount;
        this.alarmState = alarmState;
        this.isDeal = isDeal;
        this.alarmTime = alarmTime;
        this.insertTime = insertTime;
        this.updateTime = updateTime;
    }
}