module.exports = class e_parking_carEntity {
    constructor(carID, plateNo, parkingID, peopleID,
        insertTime, updateTime,
        plateColor, plateType, carBrand, carType, carColor) {
        this.carID = carID;
        this.plateNo = plateNo;
        this.parkingID = parkingID;
        this.peopleID = peopleID;
        this.insertTime = insertTime;
        this.updateTime = updateTime;
        this.plateColor = plateColor;
        this.plateType = plateType;
        this.carBrand = carBrand;
        this.carType = carType;
        this.carColor = carColor;
    }
}