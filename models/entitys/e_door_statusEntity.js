module.exports = class e_door_statusEntity {
    constructor(doorStatusID, deviceMAC, timeStamp, state) {
        this.doorStatusID = doorStatusID;
        this.deviceMAC = deviceMAC;
        this.timeStamp = timeStamp;
        this.state = state;
    }
}