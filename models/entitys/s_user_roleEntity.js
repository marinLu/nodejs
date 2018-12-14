module.exports = class s_user_roleEntity {
    constructor(ID, userID, roleID, insertTime, updateTime) {
        this.ID = ID;
        this.userID = userID;
        this.roleID = roleID;
        this.insertTime = insertTime;
        this.updateTime = updateTime;
    }
}