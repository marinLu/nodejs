module.exports = class e_sense_alarm_logEntity {
    constructor(alarmID, alarmType, optionID, villageID, alarmContent, level, isProcessed,
        processedContent, processedTime, processDeadline, longitude,
        latitude, insertTime, updateTime) {
        this.alarmID = alarmID;
        this.alarmType = alarmType;
        this.optionID = optionID;
        this.villageID = villageID;
        this.alarmContent = alarmContent;
        this.level = level;
        this.isProcessed = isProcessed;
        this.processedContent = processedContent;
        this.processedTime = processedTime;
        this.processDeadline = processDeadline;
        this.longitude = longitude;
        this.latitude = latitude;
        this.insertTime = insertTime;
        this.updateTime = updateTime;
    }
}