module.exports = {
    createFaceDB : require("./createFaceDB.js").createFaceDB,
    eigenValueAddOrModify : require("./eigenValue").addOrModify,
    delete : require("./delete").deleteFace,
    uploadAccessLog : require("./uploadAccessLog").uploadAccessLog
}