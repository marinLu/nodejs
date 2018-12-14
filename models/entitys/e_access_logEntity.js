module.exports = class e_access_logEntity {
    constructor(accessLogID, deviceID, streetID, villageID,
         buildingID, houseID, cardNo, credentialType, 
         credentialNo, openTime, openType, memo, insertTime, updateTime) {
        this.accessLogID = accessLogID;
        this.deviceID = deviceID;
        this.streetID = streetID;
        this.villageID = villageID;
        this.buildingID = buildingID;
        this.houseID = houseID;
        this.cardNo = cardNo;
        this.credentialType = credentialType;
        this.credentialNo = credentialNo;
        this.openTime = openTime;
        this.openType = openType;
        this.memo = memo;
        this.insertTime = insertTime;
        this.updateTime = updateTime;
    }
}