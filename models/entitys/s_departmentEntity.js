module.exports = class s_departmentEntity {
constructor(departmentID,code,name,parentID,isValid,isUnit,level,orderNum,description,insertTime,updateTime) {
this.departmentID = departmentID;
this.code = code;
this.name = name;
this.parentID = parentID;
this.isValid = isValid;
this.isUnit = isUnit;
this.level = level;
this.orderNum = orderNum;
this.description = description;
this.insertTime = insertTime;
this.updateTime = updateTime;
}
}
