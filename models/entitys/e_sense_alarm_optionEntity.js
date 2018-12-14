module.exports = class e_sense_alarm_optionEntity {
    constructor(optionID, villageID, modelID, flowID, alarmName, alarmLevel, isValid, isDelete, startTime, endTime, editUser, insertTime, updateTime) {
        this.optionID = optionID;
        this.villageID = villageID;
        this.modelID = modelID;
        this.flowID = flowID;
        this.alarmName = alarmName;
        this.alarmLevel = alarmLevel;
        this.isValid = isValid;
        this.isDelete = isDelete;
        this.startTime = startTime;
        this.endTime = endTime;
        this.editUser = editUser;
        this.insertTime = insertTime;
        this.updateTime = updateTime;
    }
}