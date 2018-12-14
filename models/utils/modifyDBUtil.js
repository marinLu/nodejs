const fs = require("fs");
const cFun = require("./commonFunc");

module.exports.modifyModel = async function (dalName, command, data, recodeID) {
    const dirPath = __dirname + "/../dals/";

    var stat = fs.statSync(dirPath + dalName + ".js");
    if (!stat.isFile()) {
        return -1;
    }
    var dal = require(dirPath + dalName);
    switch (command) {
        case "add":
            dal.insert(data);
            break;
        case "delete":
            if (typeof recodeID == "object") {
                console.log("数据库记录的ID格式有误");
                return -2;
            }
            dal.delete(recodeID);
            break;
        case "update":
            dal.update(data);
            break;
        default:
            break;
    }
    return 0;
}

/**
 * dalName:查询的dal模型名字
 * dbName:查询的数据库名字  
 * option:{     查询的配置参数
 *      pageSize
 *      pageNum
 *      orderBy
 *      selectColumn
 *      where
 * }
 */
module.exports.getDBRecodes = async function (dalName, dbName, option = null) {
    const dirPath = __dirname + "/../dals/";

    var stat = fs.statSync(dirPath + dalName + ".js");
    if (!stat.isFile()) {
        return -1;
    }

    var dal = require(dirPath + dalName);

    if (!dbName) {
        console.log("缺少数据库名字参数");
        return -1;
    }

    var limitSql = "";
    if (option && !cFun.isNullOrEmpty(option["pageSize"]) && !cFun.isNullOrEmpty(option["pageNum"])) {
        limitSql = `limit ${(option["pageNum"] - 1) * option["pageSize"]} , ${option["pageSize"]}`
    }

    var orderBySql = "";
    if (option && !cFun.isNullOrEmpty(option["orderBy"])) {
        if(Array.isArray(option["orderBy"])){
            orderBySql = `order by ${option["orderBy"].join(",")} desc`
        }else{
            orderBySql = `order by ${option["orderBy"]} desc`
        }
    }

    var selectColumnSql = "*";
    if (option && !cFun.isNullOrEmpty(option["selectColumn"])) {
        selectColumnSql = option["selectColumn"].join(",");
    }

    var whereSql = "1";
    if (option && !cFun.isNullOrEmpty(option["where"])) {
        whereSql = option["where"];
    }

    var selectSql = `select ${selectColumnSql} from ${dbName} where ${whereSql} ${orderBySql} ${limitSql}`;
    var countSql = `select count(*) from ${dbName} where ${whereSql}`;

    var resultData = await dal.query(selectSql);
    var resultCount = await dal.query(countSql);

    return {
        resultCount,
        resultData
    }


}