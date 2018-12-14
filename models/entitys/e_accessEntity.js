module.exports = class e_accessEntity {
    constructor(accessID, accessName, deviceID, mac, type, lockState,
        lockStateTime, inCameraID, outCameraID, insertTime, updateTime, faceGatewayMac, faceGatewayState) {
        this.accessID = accessID;
        this.accessName = accessName;
        this.deviceID = deviceID;
        this.mac = mac;
        this.type = type;
        this.lockState = lockState;
        this.lockStateTime = lockStateTime;
        this.inCameraID = inCameraID;
        this.outCameraID = outCameraID;
        this.insertTime = insertTime;
        this.updateTime = updateTime;
        this.faceGatewayMac = faceGatewayMac;
        this.faceGatewayState = faceGatewayState;
    }
}