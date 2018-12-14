module.exports = class s_roleEntity {
    constructor(roleID, roleName, orderNum, description, insertTime, updateTime) {
        this.roleID = roleID;
        this.roleName = roleName;
        this.orderNum = orderNum;
        this.description = description;
        this.insertTime = insertTime;
        this.updateTime = updateTime;
    }
}