const dbConnection = require('../dbConnection');
const Sequelize = require('sequelize');
const cFun = require('../utils/commonFunc');
const Op = dbConnection.Op;
const b_house = require('blueplus-dals').b_houseDal.b_house;

module.exports.insert = require('blueplus-dals').b_houseDal.insert;

module.exports.insertList = require('blueplus-dals').b_houseDal.insertList;

module.exports.getByHouseID = function (houseID) {
    return b_house.find({
        where: {
            houseID: houseID
        }
    });
}
// module.exports.getByFloor = function (floor) {
//     return b_house.find({
//         where: {
//             floor: floor
//         }
//     });
// }


module.exports.getByHouseIDs = function (houseIDs) {
    return b_house.findAll({
        where: {
            houseID: {
                [Op.in]: houseIDs
            }
        }
    });
}


module.exports.getByBuildingID = function (buildingID) {
    return b_house.findAll({
        where: {
            buildingID: buildingID
        },
        order: [
            ['floor', 'DESC']
        ]
    });
}
module.exports.getByBuildingIDFloor = function (buildingID) {
    return b_house.findAll({
        where: {
            buildingID: buildingID
        },
        group: 'floor'
        // group:[
        //     ['floor']
        // ]
    });
}

module.exports.getByBuildingHouseIDs = function (buildingID) {
    return b_house.findAll({
        attributes: ['houseID'],
        where: {
            buildingID: buildingID
        }
    });
}

module.exports.getByHouses = async function (villageID) {
    var sql = `
        select COUNT(*) as count from b_house where b_house.buildingID in (SELECT buildingID FROM b_building AS b_building WHERE b_building.villageID =:villageID);
    `;
    var replacements = {
        villageID: villageID,
    }
    var count = await query(sql, replacements);
    return count[0].count;
}

module.exports.getByHousesOut = async function (villageID) {
    var sql = `
        
select COUNT(*) as count from b_house where b_house.buildingID in (SELECT buildingID FROM b_building AS b_building WHERE b_building.villageID =:villageID) and b_house.houseUse=2;
   
    `;
    var replacements = {
        villageID: villageID,
    }
    var count = await query(sql, replacements);
    return count[0].count;
}
module.exports.getByHousesOwn = async function (villageID) {
    var sql = `
    select COUNT(*) as count from b_house where b_house.buildingID in (SELECT buildingID FROM b_building AS b_building WHERE b_building.villageID =:villageID) and b_house.houseUse=1;
 
    `;
    var replacements = {
        villageID: villageID,
    }
    var count = await query(sql, replacements);
    return count[0].count;
}
module.exports.getByHousesXz = async function (villageID) {
    var sql = `
    select COUNT(*) as count from b_house where b_house.buildingID in (SELECT buildingID FROM b_building AS b_building WHERE b_building.villageID =:villageID) and b_house.houseUse=3;
 
    `;
    var replacements = {
        villageID: villageID,
    }
    var count = await query(sql, replacements);
    return count[0].count;
}
module.exports.getByBuildingIDHouseNo = function (buildingID, houseNos) {
    return b_house.findAll({
        where: {
            buildingID: buildingID,
            houseNo: {
                [Op.in]: houseNos
            }
        }
    });
}

module.exports.getByBuildingIDAndFloorNos = function (buildingID, floorNos) {
    return b_house.findAll({
        where: {
            buildingID: buildingID,
            floor: {
                [Op.in]: floorNos
            }
        }
    });
}

module.exports.update = require('blueplus-dals').b_houseDal.update;


module.exports.delete = function (houseID) {
    return b_house.destroy({
        where: {
            houseID: houseID
        }
    });
}

module.exports.deleteByBuildingID = function (buildingID) {
    return b_house.destroy({
        where: {
            buildingID: buildingID
        }
    });
}
module.exports.floorIsNo = function (floor,buildingID) {
    return b_house.find({
        where: {
            floor: floor,
            buildingID:buildingID
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