const dbConnection = require('../dbConnection');
const Sequelize = require('sequelize');
const cFun = require('../utils/commonFunc');
const b_street = require('blueplus-dals').b_streetDal.b_street;
const Op = dbConnection.Op;

module.exports.insert = require('blueplus-dals').b_streetDal.insert;
module.exports.update = require('blueplus-dals').b_streetDal.update;
module.exports.update = require('blueplus-dals').b_streetDal.update;
module.exports.delete = require('blueplus-dals').b_streetDal.delete;

module.exports.getByStreetID = function (streetID) {
    return b_street.find({
        where: {
            streetID: streetID
        }
    });
}

module.exports.getByDistrictID = function (districtID) {
    return b_street.findAll({
        where: {
            districtID: districtID
        }
    });
}
module.exports.getByDistrictIDs = function (districtIDs) {
    return b_street.findAll({
        where: {
            districtID: {
                [Op.in]: districtIDs
            }
        }
    });
}
module.exports.getByStreetNo = function (streetNo) {
    return b_street.find({
        where: {
            streetNo: streetNo
        }
    });
}