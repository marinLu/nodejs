module.exports = class b_streetEntity {
    constructor(streetID, districtID, streetNo, name, pinyin, address, longitude, latitude, insertTime, updateTime) {
        this.streetID = streetID;
        this.districtID = districtID;
        this.streetNo = streetNo;
        this.name = name;
        this.pinyin = pinyin;
        this.address = address;
        this.longitude = longitude;
        this.latitude = latitude;
        this.insertTime = insertTime;
        this.updateTime = updateTime;
    }
}