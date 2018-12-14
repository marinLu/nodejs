module.exports = class b_villageEntity {
    constructor(villageID, districtID, streetID,committeeID, villageNo, name, pinyin, address,
         longitude, latitude, picUrl, curParkingCount, parkingCount,
          peopleCount, fence, firelane, insertTime, updateTime) {
        this.villageID = villageID;
        this.districtID = districtID;
        this.streetID = streetID;
        this.committeeID = committeeID;
        this.villageNo = villageNo;
        this.name = name;
        this.pinyin = pinyin;
        this.address = address;
        this.longitude = longitude;
        this.latitude = latitude;
        this.picUrl = picUrl;
        this.curParkingCount = curParkingCount;
        this.parkingCount = parkingCount;
        this.peopleCount = peopleCount;
        this.fence = fence;
        this.firelane = firelane;
        this.insertTime = insertTime;
        this.updateTime = updateTime;
    }
}