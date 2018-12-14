module.exports = class s_userTokenEntity {
    constructor(userTokenID, userID, authToken, loginSystemType, loginType, lastLoginIP, lastLoginTime, activeTime, insertTime, updateTime) {
        this.userTokenID = userTokenID;
        this.userID = userID;
        this.authToken = authToken;
        this.loginSystemType = loginSystemType;
        this.loginType = loginType;
        this.lastLoginIP = lastLoginIP;
        this.lastLoginTime = lastLoginTime;
        this.activeTime = activeTime;
        this.insertTime = insertTime;
        this.updateTime = updateTime;
    }
}