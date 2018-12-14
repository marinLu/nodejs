const dbConnection = require('../dbConnection');
const Sequelize = require('sequelize');
const Op = dbConnection.Op;
const e_bikeshed = require('blueplus-dals').e_bikeshedDal.e_bikeshed;

module.exports.insert = require('blueplus-dals').e_bikeshedDal.insert;

module.exports.getByBikeshedID = function (bikeshedID) {
    return e_bikeshed.find({
        where: {
            bikeshedID: bikeshedID
        }
    });
}

module.exports.getByVillageIDs = function (villageIDs) {
    return e_bikeshed.findAll({
        where: {
            villageID: {
                [Op.in]: villageIDs
            }
        }
    });
}

module.exports.update = require('blueplus-dals').e_bikeshedDal.update;


module.exports.delete = function (bikeshedID) {
    return e_bikeshed.destroy({
        where: {
            bikeshedID: bikeshedID
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
    return e_bikeshed.count({
        where: {
            villageID: villageID
        }
    });
}
module.exports.getByPage = function (pageNum, pageSize, villageID) {
    var sql = `
        select * from e_bikeshed
        where villageID in (:villageID) order by insertTime desc limit :startIndex,:pageSize 
    `;
    var replacements = {
        villageID: villageID,
        startIndex: (pageNum - 1) * pageSize,
        pageSize: pageSize
    }
    return query(sql, replacements);
}