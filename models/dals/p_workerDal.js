const dbConnection = require('../dbConnection');
const Sequelize = require('sequelize');
const p_worker = require('blueplus-dals').p_workerDal.p_worker


module.exports.insert = require('blueplus-dals').p_workerDal.insert;


module.exports.getByWorkerID = function (workerID) {
    return p_worker.find({
        where: {
            workerID: workerID
        }
    });
}
module.exports.getPageWorkerList = function (pageNum, pageSize, villageIDs) {
    var sql = ``;
    var replacements = {};
    sql = `
    SELECT p_worker.*
,b_village.name as villageName
,b_street.name as streetName
,b_committee.name as committeeName
,s_department.name as departmentName FROM p_worker  
	LEFT JOIN b_village on p_worker.villageID =b_village.villageID
				LEFT JOIN b_street on p_worker.streetID =b_street.streetID
			LEFT JOIN b_committee on p_worker.committeeID =b_committee.committeeID
				LEFT JOIN s_department on p_worker.departmentID =s_department.departmentID
				  WHERE p_worker.villageID in (:villageIDs)
				and   p_worker.isDeleted=0  order by p_worker.insertTime desc
        limit :startIndex,:pageSize 
    `;
    replacements = {
        startIndex: (pageNum - 1) * pageSize,
        pageSize: pageSize,
        villageIDs: villageIDs,
    }
    return query(sql, replacements);
}
module.exports.getPageWorkerListCount = async function (villageIDs) {
    var sql = `
        SELECT count(*) as count FROM p_worker  
        WHERE p_worker.villageID in (:villageIDs) and
        p_worker.isDeleted=0 
    `;
    var replacements = {
        villageIDs: villageIDs,
    }
    var count = await query(sql, replacements);
    return count[0].count;
}



module.exports.update = require('blueplus-dals').p_workerDal.update;


module.exports.delete = function (workerID) {
    return p_worker.destroy({
        where: {
            workerID: workerID
        }
    });
}

module.exports.byWorkerIDdelete = function (workerID) {
    return p_worker.update({
        isDeleted: 1,
    }, {
        where: {
            workerID: workerID
        }
    });
}

var query = function (queryString, replacements) {
    return dbConnection.query(queryString, {
        replacements: replacements,
        type: Sequelize.QueryTypes.SELECT
    });
}
module.exports.query = query;