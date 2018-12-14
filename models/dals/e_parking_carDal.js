const dbConnection = require('../dbConnection');
const Sequelize = require('sequelize');


var e_parking_car = dbConnection.define('e_parking_car', {
    carID: {
        type: Sequelize.CHAR,
        allowNull: false,
        primaryKey: true
    },
    plateNo: {
        type: Sequelize.STRING,
        allowNull: false
    },
    parkingID: {
        type: Sequelize.CHAR,
        allowNull: false
    },
    plateColor: {
        type: Sequelize.INTEGER,
        allowNull: true
    },
    plateType: {
        type: Sequelize.INTEGER,
        allowNull: true
    },
    carBrand: {
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
    peopleID: {
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
    tableName: 'e_parking_car',
    timestamps: false
});


module.exports.insert = function (data) {
    return e_parking_car.create({
        carID: data.carID,
        plateNo: data.plateNo,
        parkingID: data.parkingID,
        peopleID: data.peopleID,
        plateColor: data.plateColor,
        plateType: data.plateType,
        carBrand: data.carBrand,
        carType: data.carType,
        carColor: data.carColor
    });
}


module.exports.getByID = function (carID) {
    return e_parking_car.find({
        where: {
            carID: carID
        }
    });
}

module.exports.getByPlateNo = function (plateNo) {
    return e_parking_car.find({
        where: {
            plateNo: plateNo
        }
    });
}

module.exports.getByParkingID = function (parkingID) {
    return e_parking_car.findAll({
        where: {
            parkingID: parkingID
        }
    });
}

module.exports.getByPeopleID = function (peopleID) {
    return e_parking_car.findAll({
        where: {
            peopleID: peopleID
        }
    });
}

module.exports.update = function (data) {
    return e_parking_car.update({
        carID: data.carID,
        plateNo: data.plateNo,
        parkingID: data.parkingID,
        peopleID: data.peopleID,
        plateColor: data.plateColor,
        plateType: data.plateType,
        carBrand: data.carBrand,
        carType: data.carType,
        carColor: data.carColor
    }, {
        where: {
            carID: data.carID
        }
    });
}


module.exports.delete = function (carID) {
    return e_parking_car.destroy({
        where: {
            carID: carID
        }
    });
}


module.exports.query = function (queryString, replacements) {
    return dbConnection.query(queryString, {
        replacements: replacements,
        type: Sequelize.QueryTypes.SELECT
    });
}