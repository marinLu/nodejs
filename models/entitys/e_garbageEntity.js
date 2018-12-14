module.exports = class e_garbageEntity {
    constructor(garbageID, villageID, name, code, longitude, latitude, 
        type, gisArea, cameraIDs, insertTime, updateTime) {
        this.garbageID = garbageID;
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