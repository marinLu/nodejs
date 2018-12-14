module.exports = class p_traceEntity {
    constructor(traceID, villageID, deviceID, pID, pIDType, source, longitude, latitude, locationTime, insertTime, updateTime) {
        this.traceID = traceID;
        this.villageID = villageID;
        this.deviceID = deviceID;
        this.pID = pID;
        this.pIDType = pIDType;
        this.source = source;
        this.longitude = longitude;
        this.latitude = latitude;
        this.locationTime = locationTime;
        this.insertTime = insertTime;
        this.updateTime = updateTime;
    }
}