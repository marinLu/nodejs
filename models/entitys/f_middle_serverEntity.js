module.exports = class e_faceEntity {
    constructor(middleServerID, faceGWID, ip , port, name, serverType, insertTime, updateTime) {
        this.middleServerID = middleServerID;
        this.ip = ip;
        this.port = port;
        this.name = name;
        this.serverType = serverType;
        this.insertTime = insertTime;
        this.updateTime = updateTime;
    }
}