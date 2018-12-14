module.exports = class e_faceEntity {
    constructor(faceID, villageID, ioID, deviceID, channelNo, in_outType, insertTime, updateTime) {
        this.faceID = faceID;
        this.villageID = villageID;
        this.ioID = ioID;
        this.deviceID = deviceID;
        this.channelNo = channelNo;
        this.in_outType = in_outType;
        this.insertTime = insertTime;
        this.updateTime = updateTime;
    }
}