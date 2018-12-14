const dbConnection = require('../dbConnection');
const Sequelize = require('sequelize');


var b_province = dbConnection.define('b_province', {
    provinceID: {
        type: Sequelize.CHAR,
        allowNull: false,
        primaryKey: true
    },
    code: {
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
    tableName: 'b_province',
    timestamps: false
});


module.exports.insert = function (data) {
    return b_province.create({
        provinceID: data.provinceID,
        code: data.code,
        name: data.name,
        pinyin: data.pinyin,
        longitude: data.longitude,
        latitude: data.latitude,
    });
}


module.exports.getByProvinceID = function (provinceID) {
    return b_province.find({
        where: {
            provinceID: provinceID
        }
    });
}

module.exports.getAll = function () {
    return b_province.findAll();
}

module.exports.update = function (data) {
    return b_province.update({
        provinceID: data.provinceID,
        code: data.code,
        name: data.name,
        pinyin: data.pinyin,
        longitude: data.longitude,
        latitude: data.latitude,
    }, {
        where: {
            provinceID: data.provinceID
        }
    });
}


module.exports.delete = function (provinceID) {
    return b_province.destroy({
        where: {
            provinceID: provinceID
        }
    });
}


module.exports.query = function (queryString, replacements) {
    return dbConnection.query(queryString, {
        replacements: replacements,
        type: Sequelize.QueryTypes.SELECT
    });
}