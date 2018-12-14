module.exports = class e_parking_channelEntity {
    constructor(parkChanID, parkingID, villageID, ioID, deviceID, channelNo, in_outType, insertTime, updateTime) {
        this.parkChanID = parkChanID;
        this.parkingID = parkingID;
        this.villageID = villageID;
        this.ioID = ioID;
        this.deviceID = deviceID;
        this.channelNo = channelNo;
        this.in_outType = in_outType;
        this.insertTime = insertTime;
        this.updateTime = updateTime;
    }
}