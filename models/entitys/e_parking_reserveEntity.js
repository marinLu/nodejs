module.exports = class e_parking_reserveEntity {
    constructor(parkingReserveID, villageID, parkingID, plateNo, plateColor, carBrand, carModel, carColor, inParkingLogID, outParkingLogID, insertTime, updateTime) {
        this.parkingReserveID = parkingReserveID;
        this.villageID = villageID;
        this.parkingID = parkingID;
        this.plateNo = plateNo;
        this.plateColor = plateColor;
        this.carBrand = carBrand;
        this.carModel = carModel;
        this.carColor = carColor;
        this.inParkingLogID = inParkingLogID;
        this.outParkingLogID = outParkingLogID;
        this.insertTime = insertTime;
        this.updateTime = updateTime;
    }
}