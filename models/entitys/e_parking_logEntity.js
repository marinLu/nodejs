module.exports = class e_parking_logEntity {
    constructor(parkingLogID, villageID, parkChanID,
        plateNo, plateColor, carBrand, carModel,
        carColor, in_outType, platePic, minPlatePic,
        inOutTime, insertTime, updateTime,
        plateType, carType) {
        this.parkingLogID = parkingLogID;
        this.villageID = villageID;
        this.parkChanID = parkChanID;
        this.plateNo = plateNo;
        this.plateColor = plateColor;
        this.carBrand = carBrand;
        this.carModel = carModel;
        this.carColor = carColor;
        this.in_outType = in_outType;
        this.platePic = platePic;
        this.minPlatePic = minPlatePic;
        this.inOutTime = inOutTime;
        this.insertTime = insertTime;
        this.updateTime = updateTime;
        this.plateType = plateType;
        this.carType = carType;
    }
}