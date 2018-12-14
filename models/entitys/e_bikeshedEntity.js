module.exports = class e_bikeshedEntity {
    constructor(bikeshedID, villageID, name, code, longitude, latitude, type, gisArea, cameraIDs, insertTime, updateTime) {
        this.bikeshedID = bikeshedID;
        this.villageID = villageID;
        this.name = name;
        this.code = code;
        this.longitude = longitude;
        this.latitude = latitude;
        this.type = type;
        this.gisArea = gisArea;
        this.cameraIDs = cameraIDs;
        this.insertTime = insertTime;
        this.updateTime = updateTime;
    }
}