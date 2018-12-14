module.exports = class s_userEntity {
    constructor(userID, loginName, password, displayName, departmentID, phoneTel, tel, position, email, status, isValid, multLogin, loginSystemType, accessNet, insertTime, updateTime) {
        this.userID = userID;
        this.loginName = loginName;
        this.password = password;
        this.displayName = displayName;
        this.departmentID = departmentID;
        this.phoneTel = phoneTel;
        this.tel = tel;
        this.position = position;
        this.email = email;
        this.status = status;
        this.isValid = isValid;
        this.multLogin = multLogin;
        this.loginSystemType = loginSystemType;
        this.accessNet = accessNet;
        this.insertTime = insertTime;
        this.updateTime = updateTime;
    }
}