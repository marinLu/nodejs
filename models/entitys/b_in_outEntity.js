module.exports = class b_in_outEntity {
    constructor(ioID, villageID, buildingID, code,
        name, longitude, latitude, type, picUrl,
        insertTime, updateTime, gisArea) {
        this.ioID = ioID;
        this.villageID = villageID;
        this.buildingID = buildingID;
        this.code = code;
        this.name = name;
        this.longitude = longitude;
        this.latitude = latitude;
        this.type = type;
        this.picUrl = picUrl;
        this.insertTime = insertTime;
        this.updateTime = updateTime;
        this.gisArea = gisArea;
    }
}