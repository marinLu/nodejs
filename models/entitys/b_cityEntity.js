module.exports = class b_cityEntity {
    constructor(cityID, provinceID, cityNo, name, pinyin, longitude, latitude, insertTime, updateTime) {
        this.cityID = cityID;
        this.provinceID = provinceID;
        this.cityNo = cityNo;
        this.name = name;
        this.pinyin = pinyin;
        this.longitude = longitude;
        this.latitude = latitude;
        this.insertTime = insertTime;
        this.updateTime = updateTime;
    }
}