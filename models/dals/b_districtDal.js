const dbConnection = require('../dbConnection');
const Sequelize = require('sequelize');


var b_district = dbConnection.define('b_district', {
    districtID: {
        type: Sequelize.CHAR,
        allowNull: false,
        primaryKey:true
    },
    cityID: {
        type: Sequelize.CHAR,
        allowNull: false
    },
    districtNo: {
        type: Sequelize.STRING,
        allowNull: false
    },
    name: {
        type: Sequelize.STRING,
        allowNull: false
    },
    pinyin: {
        type: Sequelize.STRING,
        allowNull: true
    },
    longitude: {
        type: Sequelize.STRING,
        allowNull: true
    },
    latitude: {
        type: Sequelize.STRING,
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
    tableName: 'b_district',
    timestamps: false
});


module.exports.insert = function (data) {
    return b_district.create({
        districtID: data.districtID,
        cityID: data.cityID,
        districtNo: data.districtNo,
        name: data.name,
        pinyin: data.pinyin,
        longitude: data.longitude,
        latitude: data.latitude,
    });
}


module.exports.getByDistrictID = function (districtID) {
    return b_district.find({
        where: {
            districtID: districtID
        }
    });
}

module.exports.getByCityID = function (cityID) {
    return b_district.findAll({
        where: {
            cityID: cityID
        }
    });
}

module.exports.update = function (data) {
    return b_district.update({
        districtID: data.districtID,
        cityID: data.cityID,
        districtNo: data.districtNo,
        name: data.name,
        pinyin: data.pinyin,
        longitude: data.longitude,
        latitude: data.latitude,
    }, {
        where: {
            districtID: data.districtID
        }
    });
}


module.exports.delete = function (districtID) {
    return b_district.destroy({
        where: {
            districtID: districtID
        }
    });
}


module.exports.query = function (queryString, replacements) {
    return dbConnection.query(queryString, {
        replacements: replacements,
        type: Sequelize.QueryTypes.SELECT
    });
}