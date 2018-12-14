const dbConnection = require('../dbConnection');
const Sequelize = require('sequelize');


var e_parking_reserve = dbConnection.define('e_parking_reserve', {
    parkingReserveID: {
        type: Sequelize.CHAR,
        allowNull: false,
        primaryKey:true
    },
    villageID: {
        type: Sequelize.CHAR,
        allowNull: false
    },
    parkingID: {
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
    carBrand: {
        type: Sequelize.STRING,
        allowNull: true
    },
    carModel: {
        type: Sequelize.STRING,
        allowNull: true
    },
    carColor: {
        type: Sequelize.STRING,
        allowNull: true
    },
    inParkingLogID: {
        type: Sequelize.CHAR,
        allowNull: true
    },
    outParkingLogID: {
        type: Sequelize.CHAR,
        allowNull: true
    },
    insertTime: {
        type: Sequelize.DATE,
        allowNull: true
    },
    updateTime: {
        type: Sequelize.DATE,
        allowNull: true
    },
}, {
    freezeTableName: true,
    tableName: 'e_parking_reserve',
    timestamps: false
});


module.exports.insert = function (data) {
    return e_parking_reserve.create({
        parkingReserveID: data.parkingReserveID,
        villageID: data.villageID,
        parkingID: data.parkingID,
        plateNo: data.plateNo,
        plateColor: data.plateColor,
        carBrand: data.carBrand,
        carModel: data.carModel,
        carColor: data.carColor,
        inParkingLogID: data.inParkingLogID,
        outParkingLogID: data.outParkingLogID,
    });
}


module.exports.getByID = function (parkingReserveID) {
    return e_parking_reserve.find({
        where: {
            parkingReserveID: parkingReserveID
        }
    });
}


module.exports.update = function (data) {
    return e_parking_reserve.update({
        parkingReserveID: data.parkingReserveID,
        villageID: data.villageID,
        parkingID: data.parkingID,
        plateNo: data.plateNo,
        plateColor: data.plateColor,
        carBrand: data.carBrand,
        carModel: data.carModel,
        carColor: data.carColor,
        inParkingLogID: data.inParkingLogID,
        outParkingLogID: data.outParkingLogID,
    }, {
        where: {
            parkingReserveID: data.parkingReserveID
        }
    });
}


module.exports.delete = function (parkingReserveID) {
    return e_parking_reserve.destroy({
        where: {
            parkingReserveID: parkingReserveID
        }
    });
}


module.exports.query = function (queryString, replacements) {
    return dbConnection.query(queryString, {
        replacements: replacements,
        type: Sequelize.QueryTypes.SELECT
    });
}