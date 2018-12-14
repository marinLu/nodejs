module.exports = class e_device_event_logEntity {
    constructor(eventID, deviceID, deviceType, eventType, eventTime, insertTime, updateTime) {
        this.eventID = eventID;
        this.deviceID = deviceID;
        this.deviceType = deviceType;
        this.eventType = eventType;
        this.eventTime = eventTime;
        this.insertTime = insertTime;
        this.updateTime = updateTime;
    }
}