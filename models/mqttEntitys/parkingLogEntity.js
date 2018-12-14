module.exports = class parkingLogEntity {
    constructor(platePic, passTime, parkingName, plateNo,in_outType) {
        this.platePic = platePic;
        this.passTime = passTime;
        this.parkingName = parkingName;
        this.plateNo = plateNo;
        this.in_outType = in_outType;
    }
}