module.exports = class e_sense_alarm_flowEntity {
    constructor(flowID, modelID, flowName, flowRule, isValid, isDelete, editUser, insertTime, updateTime) {
        this.flowID = flowID;
        this.modelID = modelID;
        this.flowName = flowName;
        this.flowRule = flowRule;
        this.isValid = isValid;
        this.isDelete = isDelete;
        this.editUser = editUser;
        this.insertTime = insertTime;
        this.updateTime = updateTime;
    }

}