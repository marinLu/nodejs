const dbConnection = require('../dbConnection');
const Sequelize = require('sequelize');
const b_committee = require('blueplus-dals').b_committeeDal.b_committee;
const Op = dbConnection.Op;
module.exports.insert = require('blueplus-dals').b_committeeDal.insert;
module.exports.update = require('blueplus-dals').b_committeeDal.update;
module.exports.delete = require('blueplus-dals').b_committeeDal.delete;
module.exports.query = require('blueplus-dals').b_committeeDal.query;


module.exports.getByCommitteeID = function (committeeID) {
    return b_committee.find({
        where: {
            committeeID: committeeID
        }
    });
}

module.exports.getByStreetID = function (streetID) {
    return b_committee.findAll({
        where: {
            streetID: streetID
        }
    });
}
module.exports.getByStreetIDs = function (streetIDs) {
    return b_committee.findAll({
       
        where: {
            streetID: {
                [Op.in]: streetIDs
            }
        }
    });
}



