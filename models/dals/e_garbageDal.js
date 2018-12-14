const dbConnection = require('../dbConnection');
const Sequelize = require('sequelize');
const Op = dbConnection.Op;

const e_garbage = require('blueplus-dals').e_garbageDal.e_garbage;


module.exports.insert = require('blueplus-dals').e_garbageDal.insert;


module.exports.getByGarbageID = function (garbageID) {
    return e_garbage.find({
        where: {
            garbageID: garbageID
        }
    });
}


module.exports.getByVillageIDs = function (villageIDs) {
    return e_garbage.findAll({
        where: {
            villageID: {
                [Op.in]: villageIDs
            }
        }
    });
}


module.exports.update = require('blueplus-dals').e_garbageDal.update;


module.exports.delete = function (garbageID) {
    return e_garbage.destroy({
        where: {
            garbageID: garbageID
        }
    });
}

var query = function (queryString, replacements) {
    return dbConnection.query(queryString, {
        replacements: replacements,
        type: Sequelize.QueryTypes.SELECT
    });
}

module.exports.count = function (villageID) {
    return e_garbage.count({
        where: {
            villageID: villageID
        }
    });
}
module.exports.getByPage = function (pageNum, pageSize, villageID) {
    var sql = `
        select * from e_garbage
        where villageID in (:villageID) order by insertTime desc limit :startIndex,:pageSize 
    `;
    var replacements = {
        villageID: villageID,
        startIndex: (pageNum - 1) * pageSize,
        pageSize: pageSize
    }
    return query(sql, replacements);
}