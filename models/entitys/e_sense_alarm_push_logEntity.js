module.exports = class e_sense_alarm_push_logEntity {
    constructor(alarmPushID, alarmID, userID, 
        pushTime, pushMessage, status, 
        insertTime, updateTime,pushType,
        messageID) {
        this.alarmPushID = alarmPushID;
        this.alarmID = alarmID;
        this.userID = userID;
        this.pushTime = pushTime;
        this.pushMessage = pushMessage;
        this.status = status;
        this.insertTime = insertTime;
        this.updateTime = updateTime;
        this.pushType = pushType;
        this.messageID = messageID;
    }
}