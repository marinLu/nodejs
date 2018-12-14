module.exports = class s_dictionaryEntity {
    constructor(dictionaryID, name, typeName, path, insertTime, updateTime) {
        this.dictionaryID = dictionaryID;
        this.name = name;
        this.typeName = typeName;
        this.path = path;
        this.insertTime = insertTime;
        this.updateTime = updateTime;
    }
}