module.exports = class b_buildingEntity {
    constructor(buildingID, villageID, buildingNo, name, floorTotal, houseTotal, longitude, latitude, insertTime, updateTime) {
        this.buildingID = buildingID;
        this.villageID = villageID;
        this.buildingNo = buildingNo;
        this.name = name;
        this.floorTotal = floorTotal;
        this.houseTotal = houseTotal;
        this.longitude = longitude;
        this.latitude = latitude;
        this.insertTime = insertTime;
        this.updateTime = updateTime;
    }
}