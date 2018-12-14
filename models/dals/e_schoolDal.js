const dbConnection = require('../dbConnection');
const Sequelize = require('sequelize');
const Op = dbConnection.Op;
const e_school=require('blueplus-dals').e_schoolDal.e_school;


module.exports.insert =require('blueplus-dals').e_schoolDal.insert;


module.exports.getBySchoolID = function (schoolID) {
    return e_school.find({
        where: {
            schoolID: schoolID
        }
    });
}


module.exports.getByVillageIDs = function (villageIDs) {
    return e_school.findAll({
        where: {
            villageID: {
                [Op.in]: villageIDs
            }
        }
    });
}


module.exports.update = require('blueplus-dals').e_schoolDal.update;


module.exports.delete =require('blueplus-dals').e_schoolDal.delete;

var query = function (queryString, replacements) {
    return dbConnection.query(queryString, {
        replacements: replacements,
        type: 'SELECT'
    });
}

module.exports.count = function (villageID) {
    return e_school.count({
        where: {
            villageID: villageID
        }
    });
}
module.exports.getByPage = function (pageNum, pageSize, villageID) {
    var sql = `
        select * from e_school
        where villageID in (:villageID) order by insertTime desc limit :startIndex,:pageSize 
    `;
    var replacements = {
        villageID: villageID,
        startIndex: (pageNum - 1) * pageSize,
        pageSize: pageSize
    }
    return query(sql, replacements);
}
