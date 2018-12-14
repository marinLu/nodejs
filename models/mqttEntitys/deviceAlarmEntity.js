module.exports = class deviceAlarmEntity {
    constructor(alarmID, deviceID, deviceType,deviceName, alarmType,
        alarmTypeName, alarmState, isDeal, insertTime, updateTime,
        buildingID, villageID, villageName, buildingNo, houseID, houseNo, floor,
        alarmLevel, alarmLevelName, alarmCount, alarmTime,
        address, alarmContent) {
        this.alarmID = alarmID;
        this.deviceID = deviceID;
        this.deviceType = deviceType;
        this.deviceName = deviceName;
        this.alarmType = alarmType;
        this.alarmTypeName = alarmTypeName;
        this.alarmState = alarmState;
        this.isDeal = isDeal;
        this.insertTime = insertTime;
        this.updateTime = updateTime;
        this.buildingID = buildingID;
        this.villageID = villageID;
        this.villageName = villageName;
        this.alarmLevel = alarmLevel;
        this.alarmLevelName = alarmLevelName;
        this.alarmCount = alarmCount;
        this.alarmTime = alarmTime;
        this.address = address;
        this.alarmContent = alarmContent;
        this.buildingNo = buildingNo;
        this.houseID = houseID;
        this.houseNo = houseNo;
        this.floor = floor;
    }
}