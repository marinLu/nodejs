module.exports = class e_sense_alarm_modelEntity {
    constructor(modelID, modelName, modelCode, modelType, modelRule, modelComments, sceneID, isValid, isDelete, editUser, insertTime, updateTime) {
        this.modelID = modelID;
        this.modelName = modelName;
        this.modelCode = modelCode;
        this.modelType = modelType;
        this.modelRule = modelRule;
        this.modelComments = modelComments;
        this.sceneID = sceneID;
        this.isValid = isValid;
        this.isDelete = isDelete;
        this.editUser = editUser;
        this.insertTime = insertTime;
        this.updateTime = updateTime;
    }
}