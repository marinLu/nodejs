module.exports = class b_houseEntity {
    constructor(houseID, buildingID, buildingNo, houseNo, floor,
        type, insertTime, updateTime, houseLabel, houseUse, peopleNumber) {
        this.houseID = houseID;
        this.buildingID = buildingID;
        this.buildingNo = buildingNo;
        this.houseNo = houseNo;
        this.floor = floor;
        this.type = type;
        this.insertTime = insertTime;
        this.updateTime = updateTime;
        this.houseLabel = houseLabel;
        this.houseUse = houseUse;
        this.peopleNumber = peopleNumber;
    }
}