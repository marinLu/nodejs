module.exports = class e_sense_alarm_sceneEntity {
    constructor(sceneID, sceneName, sceneCode, functionID, isValid, isDelete, editUser, insertTime, updateTime) {
        this.sceneID = sceneID;
        this.sceneName = sceneName;
        this.sceneCode = sceneCode;
        this.functionID = functionID;
        this.isValid = isValid;
        this.isDelete = isDelete;
        this.editUser = editUser;
        this.insertTime = insertTime;
        this.updateTime = updateTime;
    }
}