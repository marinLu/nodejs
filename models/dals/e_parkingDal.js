const dbConnection = require('../dbConnection');
const Sequelize = require('sequelize');
const Op = dbConnection.Op;
const e_parking=require('blueplus-dals').e_parkingDal.e_parking;

module.exports.insert = require('blueplus-dals').e_parkingDal.insert;


module.exports.getByParkingID = function (parkingID) {
    return e_parking.find({
        where: {
            parkingID: parkingID
        }
    });
}

module.exports.findByVillageID = function (villageID) {
    return e_parking.find({
        where: {
            villageID: villageID
        }
    });
}

module.exports.getByVillageIDs = function (villageIDs) {
    return e_parking.findAll({
        where: {
            villageID: {
                [Op.in]: villageIDs
            }
        }
    });
}

module.exports.query = function (queryString, replacements) {
    return dbConnection.query(queryString, {
        replacements: replacements,
        type: Sequelize.QueryTypes.SELECT
    });
}

module.exports.count = function (villageID) {
    return e_parking.count({
        where: {
            villageID: {
                [Op.in]: villageID
            }
        }
    });
}
module.exports.getByPage = function (pageNum, pageSize, villageID) {
    var sql = `
        select * from e_parking
        where villageID in (:villageID) order by insertTime desc limit :startIndex,:pageSize 
    `;
    var replacements = {
        villageID: villageID,
        startIndex: (pageNum - 1) * pageSize,
        pageSize: pageSize
    }
    return dbConnection.query(sql, {replacements, type: Sequelize.QueryTypes.SELECT});
}



module.exports.update =require('blueplus-dals').e_parkingDal.update;


module.exports.delete = function (parkingID) {
    return e_parking.destroy({
        where: {
            parkingID: parkingID
        }
    });
}
