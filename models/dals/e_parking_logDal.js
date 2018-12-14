const dbConnection = require('../dbConnection');
const Sequelize = require('sequelize');
const Op = dbConnection.Op;
const cFun = require('../utils/commonFunc');

var e_parking_log = dbConnection.define('e_parking_log', {
    parkingLogID: {
        type: Sequelize.CHAR,
        allowNull: false,
        primaryKey: true
    },
    villageID: {
        type: Sequelize.CHAR,
        allowNull: false
    },
    parkChanID: {
        type: Sequelize.CHAR,
        allowNull: false
    },
    plateNo: {
        type: Sequelize.STRING,
        allowNull: false
    },
    plateColor: {
        type: Sequelize.TINYINT,
        allowNull: true
    },
    plateType: {
        type: Sequelize.TINYINT,
        allowNull: true
    },
    carBrand: {
        type: Sequelize.STRING,
        allowNull: true
    },
    carModel: {
        type: Sequelize.STRING,
        allowNull: true
    },
    carType: {
        type: Sequelize.STRING,
        allowNull: true
    },
    carColor: {
        type: Sequelize.STRING,
        allowNull: true
    },
    in_outType: {
        type: Sequelize.TINYINT,
        allowNull: false
    },
    platePic: {
        type: Sequelize.STRING,
        allowNull: false
    },
    minPlatePic: {
        type: Sequelize.STRING,
        allowNull: false
    },
    inOutTime: {
        type: Sequelize.DATE,
        allowNull: false,
        get() {
            return cFun.formatDateTime(this.getDataValue('inOutTime'));

        }
    },
    insertTime: {
        type: Sequelize.DATE,
        allowNull: true,
        get() {
            return cFun.formatDateTime(this.getDataValue('insertTime'));
        }
    },
    updateTime: {
        type: Sequelize.DATE,
        allowNull: true
    },
}, {
    freezeTableName: true,
    tableName: 'e_parking_log',
    timestamps: false
});


module.exports.insert = function (data) {
    return e_parking_log.create({
        parkingLogID: data.parkingLogID,
        villageID: data.villageID,
        parkChanID: data.parkChanID,
        plateNo: data.plateNo,
        plateColor: data.plateColor,
        carBrand: data.carBrand,
        carModel: data.carModel,
        carColor: data.carColor,
        in_outType: data.in_outType,
        platePic: data.platePic,
        minPlatePic: data.minPlatePic,
        inOutTime: data.inOutTime,
        plateType: data.plateType,
        carType: data.carType
    });
}


module.exports.getByID = function (parkingLogID) {
    return e_parking_log.find({
        where: {
            parkingLogID: parkingLogID
        }
    });
}

module.exports.getByParkChanID = function (parkChanID, startTime, endTime) {
    return e_parking_log.findAll({
        where: {
            parkChanID: parkChanID,
            inOutTime: {
                [Op.between]: [startTime, endTime]
            }
        },
        order: [
            ['inOutTime', 'DESC']
        ]
    });
}

module.exports.getList = function (parkChanIDs, startTime, endTime) {
    return e_parking_log.findAll({
        where: {
            parkChanID: {
                [Op.in]: parkChanIDs
            },
            inOutTime: {
                [Op.between]: [startTime, endTime]
            }
        }
    });
}

module.exports.update = function (data) {
    return e_parking_log.update({
        parkingLogID: data.parkingLogID,
        villageID: data.villageID,
        parkChanID: data.parkChanID,
        plateNo: data.plateNo,
        plateColor: data.plateColor,
        carBrand: data.carBrand,
        carModel: data.carModel,
        carColor: data.carColor,
        in_outType: data.in_outType,
        platePic: data.platePic,
        minPlatePic: data.minPlatePic,
        inOutTime: data.inOutTime,
        plateType: data.plateType,
        carType: data.carType
    }, {
        where: {
            parkingLogID: data.parkingLogID
        }
    });
}


module.exports.delete = function (parkingLogID) {
    return e_parking_log.destroy({
        where: {
            parkingLogID: parkingLogID
        }
    });
}


module.exports.query = function (queryString, replacements) {
    return dbConnection.query(queryString, {
        replacements: replacements,
        type: Sequelize.QueryTypes.SELECT
    });
}