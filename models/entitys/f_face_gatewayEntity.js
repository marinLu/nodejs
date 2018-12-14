module.exports = class e_faceEntity {
    constructor(middleServerID, faceGWID, faceDBID , ip , port, mac, name, villageID,buildingID, insertTime, updateTime) {
        this.middleServerID = middleServerID;
        this.faceGWID = faceGWID;
        this.faceDBID = faceDBID;
        this.mac = mac;
        this.ip = ip;
        this.port = port;
        this.name = name;
        this.villageID = villageID;
        this.status = status;
        this.insertTime = insertTime;
        this.buildingID = buildingID;
        this.updateTime = updateTime;
    }
}