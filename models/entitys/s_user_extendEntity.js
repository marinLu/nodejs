module.exports = class s_user_extendEntity {
    constructor(userID, longitude, latitude, pushRegistID, pushTags, insertTime, updateTime) {
        this.userID = userID;
        this.longitude = longitude;
        this.latitude = latitude;
        this.pushRegistID = pushRegistID;
        this.pushTags = pushTags;
        this.insertTime = insertTime;
        this.updateTime = updateTime;
    }
}