module.exports = class s_authorityEntity {
    constructor(authorityID, urType, urID, functionID, areaCode, areaName,insertTime, updateTime) {
        this.authorityID = authorityID;
        this.urType = urType;
        this.urID = urID;
        this.functionID = functionID;
        this.areaCode = areaCode;
        this.areaName=areaName;
        this.insertTime = insertTime;
        this.updateTime = updateTime;
    }
}