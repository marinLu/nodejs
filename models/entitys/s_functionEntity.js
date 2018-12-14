module.exports = class s_functionEntity {
    constructor(functionID, systemCode, moduleCode, parentFunctionCode,
        functionCode, functionName, description, index, isValid, insertTime, updateTime) {
        this.functionID = functionID;
        this.systemCode = systemCode;
        this.moduleCode = moduleCode;
        this.parentFunctionCode = parentFunctionCode;
        this.functionCode = functionCode;
        this.functionName = functionName;
        this.description = description;
        this.index = index;
        this.isValid = isValid;
        this.insertTime = insertTime;
        this.updateTime = updateTime;
    }
}