module.exports = class e_parkingEntity {
    constructor(parkingID, villageID, name, code, parkNum,
        longitude, latitude, type, insertTime, updateTime) {
        this.parkingID = parkingID;
        this.villageID = villageID;
        this.name = name;
        this.code = code;
        this.parkNum = parkNum;
        this.longitude = longitude;
        this.latitude = latitude;
        this.type = type;
        this.insertTime = insertTime;
        this.updateTime = updateTime;
    }
}